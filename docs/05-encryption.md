# 05 — Criptare (AES-256-GCM)

> **Faza implementare**: Faza 2 — Servicii
> **Dependențe**: Azure Key Vault (cheia), .NET 9 `System.Security.Cryptography`

---

## EncryptionService

```csharp
public class EncryptionService
{
    private readonly byte[] _key; // 32 bytes din Key Vault, rotate la 90 zile

    public byte[] Encrypt(string plaintext)
    {
        byte[] nonce = RandomNumberGenerator.GetBytes(12);
        byte[] plainBytes = Encoding.UTF8.GetBytes(plaintext);
        byte[] cipherBytes = new byte[plainBytes.Length];
        byte[] tag = new byte[16];
        using var aes = new AesGcm(_key);
        aes.Encrypt(nonce, plainBytes, cipherBytes, tag);
        // Returnează: nonce(12) + ciphertext + tag(16)
        var result = new byte[nonce.Length + cipherBytes.Length + tag.Length];
        Buffer.BlockCopy(nonce, 0, result, 0, nonce.Length);
        Buffer.BlockCopy(cipherBytes, 0, result, nonce.Length, cipherBytes.Length);
        Buffer.BlockCopy(tag, 0, result, nonce.Length + cipherBytes.Length, tag.Length);
        return result;
    }

    public string Decrypt(byte[] encryptedData)
    {
        byte[] nonce = encryptedData[..12];
        byte[] tag = encryptedData[^16..];
        byte[] cipherBytes = encryptedData[12..^16];
        byte[] plainBytes = new byte[cipherBytes.Length];
        using var aes = new AesGcm(_key);
        aes.Decrypt(nonce, cipherBytes, tag, plainBytes);
        return Encoding.UTF8.GetString(plainBytes);
    }
}
```

---

## Ce criptăm

| Date | Motiv |
|------|-------|
| `Submissions.SourceCode` (codul C++ al elevului) | Confidențialitate — codul sursă e proprietatea elevului |
| `Messages.Body` (opțional) | Doar pentru conversații private profesor-elev |

---

## Configurare Key Vault

```csharp
// Program.cs
builder.Configuration.AddAzureKeyVault(
    new Uri("https://infolicu-kv.vault.azure.net/"),
    new DefaultAzureCredential());

// În serviciu:
public class EncryptionService
{
    public EncryptionService(IConfiguration config)
    {
        _key = Convert.FromBase64String(config["EncryptionKey"]);
    }
}
```

---

## 🔗 Documente conexe

- [00-overview.md](./00-overview.md) — Tech stack (Key Vault menționat)
