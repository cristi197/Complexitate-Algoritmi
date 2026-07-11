# 06 — C++ Testing (Docker Sandbox)

> **Faza implementare**: Faza 4 — Quiz + C++
> **Dependențe**: Docker, .NET `System.Diagnostics.Process`

---

## CppTestRunner

```csharp
public async Task<TestResult> RunTests(string source, string input, 
    string expected, int timeMs, int memKb)
{
    var dir = Path.Combine(Path.GetTempPath(), Guid.NewGuid().ToString());
    Directory.CreateDirectory(dir);
    try {
        await File.WriteAllTextAsync(Path.Combine(dir, "sol.cpp"), source);
        
        var compile = await DockerRun("g++ -std=c++17 -O2 sol.cpp -o sol", dir);
        if (!compile.Ok) return TestResult.CompileError(compile.Stderr);
        
        var run = await DockerRun("./sol", dir, timeMs, memKb, input);
        if (run.TimedOut) return TestResult.Timeout();
        if (run.OOM)      return TestResult.OutOfMemory();
        
        return run.Stdout.Trim() == expected.Trim()
            ? TestResult.Passed(run.TimeMs, run.MemKb)
            : TestResult.Wrong(run.Stdout, expected);
    }
    finally { if (Directory.Exists(dir)) Directory.Delete(dir, true); }
}
```

---

## Docker Sandbox Image

```dockerfile
# sandbox.Dockerfile
FROM gcc:13-bookworm
RUN useradd -m sandbox
USER sandbox
WORKDIR /work
```

```bash
docker build -t sandbox:latest -f sandbox.Dockerfile .
```

### Comanda Docker run

```bash
docker run --rm --network=none \
  --memory=64m --cpus=0.5 \
  -v /tmp/xyz:/work \
  sandbox:latest \
  /bin/sh -c "g++ -std=c++17 -O2 sol.cpp -o sol && ./sol"
```

---

## TestResult (enum-like model)

```csharp
public record TestResult
{
    public bool Passed { get; init; }
    public string Error { get; init; }
    public string Output { get; init; }
    public int TimeMs { get; init; }
    public int MemKb { get; init; }

    public static TestResult Passed(int timeMs, int memKb) =>
        new() { Passed = true, TimeMs = timeMs, MemKb = memKb };

    public static TestResult CompileError(string errors) =>
        new() { Passed = false, Error = errors };

    public static TestResult Timeout() =>
        new() { Passed = false, Error = "Timpul limită depășit" };

    public static TestResult OutOfMemory() =>
        new() { Passed = false, Error = "Memoria limită depășită" };

    public static TestResult Wrong(string output, string expected) =>
        new() { Passed = false, Output = output, Error = $"Expected: {expected}" };
}
```

---

## Limitări de securitate

| Mecanism | Valoare |
|----------|---------|
| `--network=none` | Fără acces la rețea |
| `--memory=64m` | Maxim 64 MB RAM |
| `--cpus=0.5` | Maxim 0.5 CPU |
| Timeout execuție | 1 secundă (configurabil per exercițiu) |
| User non-root | Rulează ca `sandbox` |

---

## Flow complet

Vezi [09-diagrams.md](./09-diagrams.md) pentru diagrama PlantUML a flow-ului de execuție C++.

---

## 🔗 Documente conexe

- [09-diagrams.md](./09-diagrams.md) — Flow execuție C++ (PlantUML)
- [01-database-schema.md](./01-database-schema.md) — Tabela `Submissions`
- [05-encryption.md](./05-encryption.md) — Criptarea codului sursă
