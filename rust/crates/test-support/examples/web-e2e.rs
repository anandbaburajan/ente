use std::{collections::BTreeMap, fs, net::TcpListener, path::Path, process::Command};

use ente_test_support::{Museum, TestResult, account_fixture::create_account};

#[derive(serde::Deserialize)]
struct WebApp {
    museum_key: Option<String>,
}

fn main() -> TestResult {
    if std::env::args().nth(1).as_deref() == Some("create-account") {
        let endpoint = std::env::var("NEXT_PUBLIC_ENTE_ENDPOINT")?;
        let account =
            tokio::runtime::Runtime::new()?.block_on(create_account(&endpoint, "web-e2e"))?;
        println!(
            "{}",
            serde_json::json!({ "email": account.email, "password": account.password })
        );
        return Ok(());
    }

    let web_dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../web");
    let apps: BTreeMap<String, WebApp> =
        serde_json::from_slice(&fs::read(web_dir.join("e2e/apps.json"))?)?;
    let mut urls = BTreeMap::new();
    let mut listeners = Vec::new();
    let mut env = Vec::new();
    for (name, app) in apps {
        let listener = TcpListener::bind("127.0.0.1:0")?;
        let url = format!("http://127.0.0.1:{}", listener.local_addr()?.port());
        if let Some(key) = app.museum_key {
            env.push((
                format!("ENTE_APPS_{}", key.replace('-', "_").to_uppercase()),
                url.clone(),
            ));
        }
        urls.insert(name, url);
        listeners.push(listener);
    }
    let museum_env: Vec<_> = env
        .iter()
        .map(|(key, value)| (key.as_str(), value.as_str()))
        .collect();
    Museum::run_with_env(&museum_env, |museum| {
        drop(listeners);
        let status = Command::new("npm")
            .current_dir(&web_dir)
            .args([
                "exec",
                "--workspace",
                "ente-web-e2e",
                "--",
                "playwright",
                "test",
            ])
            .args(std::env::args_os().skip(1))
            .env("NEXT_PUBLIC_ENTE_ENDPOINT", museum.endpoint())
            .env("ENTE_E2E_URLS", serde_json::to_string(&urls)?)
            .env("ENTE_E2E_FIXTURE_BIN", std::env::current_exe()?)
            .env_remove("_ENTE_IS_DESKTOP")
            .status()?;
        if !status.success() {
            let results_dir = web_dir.join("e2e/test-results");
            fs::create_dir_all(&results_dir)?;
            fs::copy(
                museum.temp_dir().join("logs/museum.log"),
                results_dir.join("museum.log"),
            )?;
            return Err(format!("Playwright exited with {status}").into());
        }
        Ok(())
    })
}
