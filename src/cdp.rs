use std::collections::{HashMap, HashSet};
use std::net::{IpAddr, SocketAddr, TcpStream};
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::Duration;

use anyhow::{Context, Result, bail};
use reqwest::blocking::Client;
use serde::Deserialize;
use serde_json::{Value, json};
use tungstenite::client::IntoClientRequest;
use tungstenite::http::{HeaderValue, header::ORIGIN};
use tungstenite::stream::MaybeTlsStream;
use tungstenite::{Message, WebSocket, connect};
use url::Url;

const HTTP_TIMEOUT: Duration = Duration::from_secs(3);
const SOCKET_TIMEOUT: Duration = Duration::from_secs(5);
const POLL_INTERVAL: Duration = Duration::from_millis(900);
const HEALTH_INTERVAL_TICKS: u64 = 6;

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct VersionInfo {
    web_socket_debugger_url: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct TargetInfo {
    pub id: String,
    #[serde(rename = "type")]
    pub target_type: String,
    #[serde(default)]
    pub title: String,
    #[serde(default)]
    pub url: String,
    pub web_socket_debugger_url: Option<String>,
}

pub struct CdpClient {
    port: u16,
    browser_identity: String,
    http: Client,
}

impl CdpClient {
    pub fn connect(port: u16) -> Result<Self> {
        let http = Client::builder()
            .no_proxy()
            .timeout(HTTP_TIMEOUT)
            .build()
            .context("failed to create the loopback HTTP client")?;
        let version: VersionInfo = get_json(&http, port, "/json/version")?;
        validate_debugger_url(&version.web_socket_debugger_url, port, "browser")?;
        let client = Self {
            port,
            browser_identity: version.web_socket_debugger_url,
            http,
        };
        if client.injectable_targets()?.is_empty() {
            bail!("the CDP endpoint does not expose a Codex renderer target");
        }
        Ok(client)
    }

    pub fn watch_and_inject(&self, script: &str, running: &AtomicBool) -> Result<()> {
        let mut sessions: HashMap<String, TargetSession> = HashMap::new();
        let mut tick = 0_u64;
        let mut waiting_reported = false;

        while running.load(Ordering::SeqCst) {
            self.verify_browser_identity()?;
            let targets = self.injectable_targets()?;
            let active_ids: HashSet<&str> =
                targets.iter().map(|target| target.id.as_str()).collect();
            sessions.retain(|id, session| {
                if active_ids.contains(id.as_str()) {
                    true
                } else {
                    session.close();
                    false
                }
            });

            if targets.is_empty() {
                if !waiting_reported {
                    println!("Waiting for a Codex renderer target...");
                    waiting_reported = true;
                }
            } else {
                waiting_reported = false;
            }

            for target in targets {
                if sessions.contains_key(&target.id) {
                    continue;
                }
                match TargetSession::connect_and_install(&target, self.port, script) {
                    Ok(session) => {
                        println!("CoTypeX injected into Codex target {}", target.id);
                        sessions.insert(target.id.clone(), session);
                    }
                    Err(error) => {
                        eprintln!("Could not inject target {}: {error:#}", target.id);
                    }
                }
            }

            tick += 1;
            if tick.is_multiple_of(HEALTH_INTERVAL_TICKS) {
                let unhealthy = sessions
                    .iter_mut()
                    .filter_map(|(id, session)| match session.is_healthy() {
                        Ok(true) => None,
                        Ok(false) | Err(_) => Some(id.clone()),
                    })
                    .collect::<Vec<_>>();
                for id in unhealthy {
                    if let Some(mut session) = sessions.remove(&id) {
                        let _ = session.remove_cotypex();
                        session.close();
                    }
                }
            }

            thread::sleep(POLL_INTERVAL);
        }

        for session in sessions.values_mut() {
            let _ = session.remove_cotypex();
            session.close();
        }
        Ok(())
    }

    fn verify_browser_identity(&self) -> Result<()> {
        let version: VersionInfo = get_json(&self.http, self.port, "/json/version")?;
        validate_debugger_url(&version.web_socket_debugger_url, self.port, "browser")?;
        if version.web_socket_debugger_url != self.browser_identity {
            bail!("the CDP browser identity changed while CoTypeX was running");
        }
        Ok(())
    }

    fn injectable_targets(&self) -> Result<Vec<TargetInfo>> {
        let targets: Vec<TargetInfo> = get_json(&self.http, self.port, "/json/list")?;
        Ok(targets
            .into_iter()
            .filter(|target| is_injectable_codex_target(target, self.port))
            .collect())
    }
}

struct TargetSession {
    socket: WebSocket<MaybeTlsStream<TcpStream>>,
    next_id: u64,
    script_identifier: Option<String>,
}

impl TargetSession {
    fn connect_and_install(target: &TargetInfo, port: u16, script: &str) -> Result<Self> {
        let debugger_url = target
            .web_socket_debugger_url
            .as_deref()
            .context("Codex target does not expose a debugger WebSocket")?;
        validate_debugger_url(debugger_url, port, "page")?;

        let mut request = debugger_url
            .into_client_request()
            .context("failed to build the CDP WebSocket request")?;
        request.headers_mut().insert(
            ORIGIN,
            HeaderValue::from_str(&format!("http://127.0.0.1:{port}"))?,
        );
        let (mut socket, _) =
            connect(request).context("failed to connect to the Codex CDP target")?;
        set_socket_timeouts(&mut socket)?;

        let mut session = Self {
            socket,
            next_id: 1,
            script_identifier: None,
        };
        let registration = session.command(
            "Page.addScriptToEvaluateOnNewDocument",
            json!({ "source": script }),
        )?;
        let identifier = registration
            .pointer("/result/identifier")
            .and_then(Value::as_str)
            .context("CDP did not return a new-document script identifier")?
            .to_string();
        session.script_identifier = Some(identifier);
        if let Err(error) = session.command(
            "Runtime.evaluate",
            json!({
                "expression": script,
                "awaitPromise": true,
                "returnByValue": true,
                "allowUnsafeEvalBlockedByCSP": true
            }),
        ) {
            let _ = session.unregister_new_document_script();
            return Err(error);
        }
        Ok(session)
    }

    fn is_healthy(&mut self) -> Result<bool> {
        let response = self.command(
            "Runtime.evaluate",
            json!({
                "expression": "window.__COTYPEX__?.version === '0.3.0'",
                "returnByValue": true
            }),
        )?;
        Ok(response
            .pointer("/result/result/value")
            .and_then(Value::as_bool)
            .unwrap_or(false))
    }

    fn remove_cotypex(&mut self) -> Result<()> {
        let unregister_result = self.unregister_new_document_script();
        let cleanup_result = self.command(
            "Runtime.evaluate",
            json!({
                "expression": "window.__COTYPEX__?.destroy?.()",
                "returnByValue": true
            }),
        );
        unregister_result?;
        cleanup_result?;
        Ok(())
    }

    fn unregister_new_document_script(&mut self) -> Result<()> {
        let Some(identifier) = self.script_identifier.take() else {
            return Ok(());
        };
        self.command(
            "Page.removeScriptToEvaluateOnNewDocument",
            json!({ "identifier": identifier }),
        )?;
        Ok(())
    }

    fn command(&mut self, method: &str, params: Value) -> Result<Value> {
        let id = self.next_id;
        self.next_id += 1;
        let payload = json!({ "id": id, "method": method, "params": params });
        self.socket
            .send(Message::Text(payload.to_string().into()))
            .with_context(|| format!("failed to send CDP command {method}"))?;

        loop {
            let message = self
                .socket
                .read()
                .with_context(|| format!("failed to read CDP response for {method}"))?;
            let Message::Text(text) = message else {
                continue;
            };
            let response: Value =
                serde_json::from_str(text.as_str()).context("CDP returned invalid JSON")?;
            if response.get("id").and_then(Value::as_u64) != Some(id) {
                continue;
            }
            if let Some(error) = response.get("error") {
                bail!("CDP command {method} failed: {error}");
            }
            if let Some(exception) = response.pointer("/result/exceptionDetails") {
                bail!("CDP evaluation raised an exception: {exception}");
            }
            return Ok(response);
        }
    }

    fn close(&mut self) {
        let _ = self.socket.close(None);
    }
}

fn get_json<T: for<'de> Deserialize<'de>>(client: &Client, port: u16, path: &str) -> Result<T> {
    let url = format!("http://127.0.0.1:{port}{path}");
    client
        .get(&url)
        .send()
        .with_context(|| format!("failed to reach {url}"))?
        .error_for_status()
        .with_context(|| format!("CDP endpoint rejected {path}"))?
        .json::<T>()
        .with_context(|| format!("CDP endpoint returned invalid JSON for {path}"))
}

fn is_injectable_codex_target(target: &TargetInfo, port: u16) -> bool {
    if target.target_type != "page" || target.web_socket_debugger_url.is_none() {
        return false;
    }
    if target.url.to_ascii_lowercase().contains("avatar-overlay") {
        return false;
    }
    let title = target.title.trim().to_ascii_lowercase();
    let url = target.url.trim().to_ascii_lowercase();
    let looks_like_codex = url.starts_with("app://")
        || title == "codex"
        || title == "chatgpt"
        || url.starts_with("https://chatgpt.com/")
        || url == "https://chatgpt.com";
    looks_like_codex
        && target
            .web_socket_debugger_url
            .as_deref()
            .is_some_and(|value| validate_debugger_url(value, port, "page").is_ok())
}

fn validate_debugger_url(value: &str, port: u16, target_kind: &str) -> Result<()> {
    let url = Url::parse(value).context("CDP returned an invalid WebSocket URL")?;
    if url.scheme() != "ws"
        || url.port() != Some(port)
        || url.username() != ""
        || url.password().is_some()
    {
        bail!("CDP WebSocket URL has an unexpected origin");
    }
    let host = url.host_str().context("CDP WebSocket URL has no host")?;
    let ip: IpAddr = host
        .trim_matches(['[', ']'])
        .parse()
        .context("CDP WebSocket host is not an IP address")?;
    if !ip.is_loopback() {
        bail!("CDP WebSocket is not bound to a loopback address");
    }
    let expected_prefix = format!("/devtools/{target_kind}/");
    if !url.path().starts_with(&expected_prefix)
        || url.query().is_some()
        || url.fragment().is_some()
    {
        bail!("CDP WebSocket path does not identify a {target_kind} target");
    }
    Ok(())
}

fn set_socket_timeouts(socket: &mut WebSocket<MaybeTlsStream<TcpStream>>) -> Result<()> {
    let MaybeTlsStream::Plain(stream) = socket.get_mut() else {
        bail!("loopback CDP unexpectedly negotiated TLS");
    };
    stream.set_read_timeout(Some(SOCKET_TIMEOUT))?;
    stream.set_write_timeout(Some(SOCKET_TIMEOUT))?;
    Ok(())
}

pub fn endpoint_is_available(port: u16) -> bool {
    CdpClient::connect(port).is_ok()
}

pub fn port_is_free(port: u16) -> bool {
    std::net::TcpListener::bind(SocketAddr::from(([127, 0, 0, 1], port))).is_ok()
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::TcpListener;

    fn target(url: &str, websocket: &str) -> TargetInfo {
        TargetInfo {
            id: "page-1".to_string(),
            target_type: "page".to_string(),
            title: "Codex".to_string(),
            url: url.to_string(),
            web_socket_debugger_url: Some(websocket.to_string()),
        }
    }

    #[test]
    fn accepts_loopback_page_target() {
        let item = target(
            "app://-/index.html",
            "ws://127.0.0.1:9337/devtools/page/page-1",
        );
        assert!(is_injectable_codex_target(&item, 9337));
    }

    #[test]
    fn rejects_non_loopback_websocket() {
        let item = target(
            "app://-/index.html",
            "ws://192.168.1.10:9337/devtools/page/page-1",
        );
        assert!(!is_injectable_codex_target(&item, 9337));
    }

    #[test]
    fn rejects_avatar_overlay() {
        let item = target(
            "app://-/index.html?initialRoute=/avatar-overlay",
            "ws://127.0.0.1:9337/devtools/page/page-1",
        );
        assert!(!is_injectable_codex_target(&item, 9337));
    }

    #[test]
    fn target_session_runs_the_complete_injection_lifecycle() {
        let listener = TcpListener::bind("127.0.0.1:0").unwrap();
        let port = listener.local_addr().unwrap().port();
        let server = std::thread::spawn(move || {
            let (stream, _) = listener.accept().unwrap();
            let mut socket = tungstenite::accept(stream).unwrap();
            let expected = [
                "Page.addScriptToEvaluateOnNewDocument",
                "Runtime.evaluate",
                "Runtime.evaluate",
                "Page.removeScriptToEvaluateOnNewDocument",
                "Runtime.evaluate",
            ];
            for (index, method) in expected.into_iter().enumerate() {
                let Message::Text(text) = socket.read().unwrap() else {
                    panic!("expected a text CDP command");
                };
                let request: Value = serde_json::from_str(text.as_str()).unwrap();
                assert_eq!(request["method"], method);
                let id = request["id"].as_u64().unwrap();
                let result = if index == 0 {
                    json!({ "identifier": "script-1" })
                } else if index == 2 {
                    json!({ "result": { "value": true } })
                } else {
                    json!({ "result": {} })
                };
                let response = json!({ "id": id, "result": result });
                socket
                    .send(Message::Text(response.to_string().into()))
                    .unwrap();
            }
            let _ = socket.close(None);
        });

        let target = target(
            "app://-/index.html",
            &format!("ws://127.0.0.1:{port}/devtools/page/page-1"),
        );
        let mut session = TargetSession::connect_and_install(&target, port, "window.test = true;")
            .expect("the simulated CDP target should accept injection");
        assert!(session.is_healthy().unwrap());
        session.remove_cotypex().unwrap();
        session.close();
        server.join().unwrap();
    }
}
