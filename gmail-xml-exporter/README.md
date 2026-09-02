# Exportador de XML do Gmail

Rotina separada do CRM Cabana para baixar anexos XML de mensagens com o marcador Gmail `NF Fabrica`.

## Preparar

1. No Google Cloud Console, crie ou selecione um projeto.
2. Ative a Gmail API.
3. Crie uma credencial OAuth do tipo aplicativo para computador.
4. Baixe o JSON da credencial e salve como:

```text
gmail-xml-exporter/credentials.json
```

5. Copie `config.example.json` para `config.json` e ajuste o diretorio de destino:

```json
{
  "labelName": "NF Fabrica",
  "outputDir": "G:/Meu Drive/XML NF Fabrica"
}
```

6. Nao e necessario instalar pacotes externos. A rotina usa apenas recursos nativos do Node.js.

## Executar

```powershell
cd "G:\Meu Drive\Codex\CRMCABANA\gmail-xml-exporter"
npm run baixar
```

Na primeira execucao, a rotina mostra uma URL do Google. Abra a URL e autorize a conta Gmail. O navegador mostra a confirmacao e o acesso fica salvo em `token.json`.

Tambem e possivel informar o diretorio no comando:

```powershell
npm run baixar -- --output "G:\Meu Drive\XML NF Fabrica"
```

Ou informar outro marcador:

```powershell
npm run baixar -- --label "NF Fabrica" --output "G:\Meu Drive\XML NF Fabrica"
```

## O que a rotina faz

- Localiza o marcador informado no Gmail.
- Busca mensagens desse marcador com anexos XML.
- Baixa anexos `.xml` ou com MIME type XML.
- Evita sobrescrever arquivos repetidos.
- Mostra um resumo com mensagens analisadas e arquivos salvos.
