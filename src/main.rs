mod cdp;
mod discovery;

use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread;
use std::time::{Duration, Instant};

use anyhow::{Context, Result, bail};
use clap::{Parser, Subcommand};

const COTYPEX_SCRIPT: &str = include_str!("../dist/cotypex.user.js");
const DEFAULT_PORT: u16 = 9337;

#[derive(Parser)]
#[command(
    name = "cotypex",
    version,
    about = "Run CoTypeX inside the Codex desktop composer"
)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Launch Codex with a loopback CDP port, then inject CoTypeX.
    Run {
        #[arg(long, value_name = "PATH")]
        codex_path: Option<PathBuf>,
        #[arg(long, default_value_t = DEFAULT_PORT)]
        port: u16,
        #[arg(long, default_value_t = 45)]
        timeout_seconds: u64,
    },
    /// Attach to an already running Codex CDP endpoint.
    Attach {
        #[arg(long, default_value_t = DEFAULT_PORT)]
        port: u16,
    },
    /// Install the shared user script for Codex++.
    InstallCodexPlusPlus {
        #[arg(long, value_name = "DIRECTORY")]
        directory: Option<PathBuf>,
    },
}

fn main() {
    if let Err(error) = run_cli() {
        eprintln!("CoTypeX failed: {error:#}");
        std::process::exit(1);
    }
}

fn run_cli() -> Result<()> {
    let cli = Cli::parse();
    match cli.command {
        Commands::Run {
            codex_path,
            port,
            timeout_seconds,
        } => run_standalone(codex_path.as_deref(), port, timeout_seconds),
        Commands::Attach { port } => attach_and_watch(port),
        Commands::InstallCodexPlusPlus { directory } => install_codex_plus_plus(directory),
    }
}

fn run_standalone(codex_path: Option<&Path>, port: u16, timeout_seconds: u64) -> Result<()> {
    validate_port(port)?;
    if cdp::endpoint_is_available(port) {
        println!("Using the existing verified CDP endpoint on 127.0.0.1:{port}");
        return attach_and_watch(port);
    }
    if !cdp::port_is_free(port) {
        bail!("port {port} is occupied by a service that is not a verified CDP endpoint");
    }

    let application = discovery::resolve_codex_application(codex_path)?;
    println!("Launching {}", application.path().display());
    let native_args = [
        "--remote-debugging-address=127.0.0.1".to_string(),
        format!("--remote-debugging-port={port}"),
        format!("--remote-allow-origins=http://127.0.0.1:{port}"),
    ];
    application.launch(&native_args)?;

    let deadline = Instant::now() + Duration::from_secs(timeout_seconds);
    while Instant::now() < deadline {
        if cdp::endpoint_is_available(port) {
            return attach_and_watch(port);
        }
        thread::sleep(Duration::from_millis(400));
    }

    bail!(
        "Codex did not expose CDP on port {port} within {timeout_seconds} seconds. Close every existing Codex window and run CoTypeX again"
    )
}

fn attach_and_watch(port: u16) -> Result<()> {
    validate_port(port)?;
    let client = cdp::CdpClient::connect(port)
        .with_context(|| format!("no verified Codex CDP endpoint is available on port {port}"))?;
    let running = Arc::new(AtomicBool::new(true));
    let signal = Arc::clone(&running);
    ctrlc::set_handler(move || {
        signal.store(false, Ordering::SeqCst);
    })
    .context("failed to install the Ctrl+C handler")?;

    println!("CoTypeX is active. Press Ctrl+Alt+T inside Codex to start typing practice.");
    println!("Keep this process running; press Ctrl+C to remove the injected behavior.");
    client.watch_and_inject(COTYPEX_SCRIPT, &running)
}

fn install_codex_plus_plus(directory: Option<PathBuf>) -> Result<()> {
    let root = match directory {
        Some(path) => path,
        None => default_codex_plus_plus_directory()?,
    };
    fs::create_dir_all(&root).with_context(|| format!("failed to create {}", root.display()))?;
    let destination = root.join("cotypex.js");
    fs::write(&destination, COTYPEX_SCRIPT)
        .with_context(|| format!("failed to write {}", destination.display()))?;
    println!(
        "Installed the Codex++ user script at {}",
        destination.display()
    );
    println!("Enable user scripts in Codex++ and reload them or restart Codex++.");
    Ok(())
}

fn default_codex_plus_plus_directory() -> Result<PathBuf> {
    #[cfg(windows)]
    {
        let app_data = std::env::var_os("APPDATA")
            .context("APPDATA is not defined; pass --directory explicitly")?;
        Ok(PathBuf::from(app_data).join("Codex++").join("user_scripts"))
    }

    #[cfg(target_os = "macos")]
    {
        let config_root = match std::env::var_os("XDG_CONFIG_HOME") {
            Some(path) => PathBuf::from(path),
            None => {
                let home = std::env::var_os("HOME")
                    .context("HOME is not defined; pass --directory explicitly")?;
                PathBuf::from(home).join(".config")
            }
        };
        Ok(config_root.join("Codex++").join("user_scripts"))
    }

    #[cfg(not(any(windows, target_os = "macos")))]
    {
        bail!("the default Codex++ script directory is supported only on Windows and macOS")
    }
}

fn validate_port(port: u16) -> Result<()> {
    if port < 1024 {
        bail!("CDP port must be between 1024 and 65535");
    }
    Ok(())
}
