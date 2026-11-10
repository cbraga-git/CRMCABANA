import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { deflateRawSync } from 'node:zlib';
import test from 'node:test';

for (const folder of ['crmcabana', 'gestaocabana']) {
 const source = await readFile(new URL('../' + folder + '/app.js', import.meta.url), 'utf8');
 const context = { TextDecoder, TextEncoder, DataView, Uint8Array, Blob, File, DecompressionStream };
 const crcStart = source.indexOf('const BACKUP_ZIP_CRC_TABLE');
 const crcEnd = source.indexOf('function backupZipBlob(', crcStart);
 const start = source.indexOf('async function nobiliaXmlFiles(');
 const end = source.indexOf('async function importPromobXmlFiles(', start);
 runInNewContext(source.slice(crcStart, crcEnd) + source.slice(start, end), context);
 function zip(entries, method = 8) {
   const locals = [], central = []; let offset = 0;
   for (const [name, text] of entries) {
     const filename = Buffer.from(name), data = Buffer.from(text);
     const compressed = method === 8 ? deflateRawSync(data) : data;
     const local = Buffer.alloc(30); local.writeUInt32LE(0x04034b50); local.writeUInt16LE(method, 8);
     local.writeUInt32LE(context.backupZipCrc32(data), 14); local.writeUInt32LE(compressed.length, 18); local.writeUInt32LE(data.length, 22); local.writeUInt16LE(filename.length, 26);
     const dir = Buffer.alloc(46); dir.writeUInt32LE(0x02014b50); dir.writeUInt16LE(method, 10); dir.writeUInt32LE(context.backupZipCrc32(data), 16); dir.writeUInt32LE(compressed.length, 20); dir.writeUInt32LE(data.length, 24); dir.writeUInt16LE(filename.length, 28); dir.writeUInt32LE(offset, 42);
     locals.push(local, filename, compressed); central.push(dir, filename); offset += local.length + filename.length + compressed.length;
   }
   const directory = Buffer.concat(central), end = Buffer.alloc(22);
   end.writeUInt32LE(0x06054b50); end.writeUInt16LE(entries.length, 8); end.writeUInt16LE(entries.length, 10); end.writeUInt32LE(directory.length, 12); end.writeUInt32LE(offset, 16);
   return new File([Buffer.concat([...locals, directory, end])], 'nobilia.ZIP');
 }
 test(folder + ': mantém XML direto e extrai XMLs em subpastas com compressão e sem compressão', async () => {
   const original = new File(['<xml/>'], 'ambiente.XML');
   assert.equal((await context.nobiliaXmlFiles(original))[0], original);
   for (const method of [0, 8]) {
     const files = await context.nobiliaXmlFiles(zip([['ambientes/cozinha.XML','<cozinha/>'], ['foto.jpg','imagem'], ['area.xml','<area/>'], ['__MACOSX/._area.xml','ignorar']], method));
     assert.equal(files.length, 2); assert.equal(await files[0].text(), '<cozinha/>'); assert.equal(await files[1].text(), '<area/>');
   }
 });
 test(folder + ': informa ZIP vazio, inválido, corrompido e formato incorreto', async () => {
   await assert.rejects(context.nobiliaXmlFiles(zip([['foto.jpg','foto']])), /Nenhum arquivo XML/);
   await assert.rejects(context.nobiliaXmlFiles(new File(['bad'], 'bad.zip')), /ZIP inválido/);
   await assert.rejects(context.nobiliaXmlFiles(new File(['bad'], 'bad.pdf')), /XML ou ZIP/);
   const valid = zip([['a.xml','abc']], 0); const bytes = new Uint8Array(await valid.arrayBuffer()); bytes[35] ^= 1;
   await assert.rejects(context.nobiliaXmlFiles(new File([bytes], 'bad.zip')), /corrompido/);
 });
 test(folder + ': preserva bytes windows-1252 e rejeita ZIP protegido', async () => {
   const valid = zip([['a.xml','á']], 0); const bytes = new Uint8Array(await valid.arrayBuffer());
   const view = new DataView(bytes.buffer); const central = view.getUint32(bytes.length - 6, true); view.setUint16(central + 8, 1, true);
   await assert.rejects(context.nobiliaXmlFiles(new File([bytes], 'protected.zip')), /senha/);
   const files = await context.nobiliaXmlFiles(zip([['a.xml', Buffer.from([0xe1])]], 0));
   assert.equal(new Uint8Array(await files[0].arrayBuffer())[0], 0xe1);
 });
 test(folder + ': fluxo de importação processa XML dentro do ZIP e não altera formulário se falhar', async () => {
   let applied = 0, dirty = 0, message = '';
   Object.assign(context, {
     readImportFileText: file => file.text(),
     DOMParser: class { parseFromString(text) { return { text, querySelector: () => null }; } },
     elements: { budgetClientSelect: { value: 'existing-client' } },
     promobEnvironmentsFromDoc: doc => doc.text === '<cozinha/>' ? [{ name: 'Cozinha', gross: 100, factory: 50 }] : [],
     applyPromobEnvironmentToBudgetForm: () => { applied++; return 'added'; },
     state: { view: 'budget' }, setBudgetTableOrderMode: () => {},
     markBudgetDirty: () => { dirty++; }, updateBudgetSummary: () => {},
     alert: text => { message = text; }, console: { warn() {} },
   });
   const endImport = source.indexOf('function openPromobImportFilePicker(', end);
   runInNewContext(source.slice(end, endImport), context);
   await context.importPromobXmlFiles([zip([['cozinha.xml', '<cozinha/>']])]);
   assert.equal(applied, 1); assert.equal(dirty, 1); assert.match(message, /1 ambiente/);
   await context.importPromobXmlFiles([zip([['foto.jpg', 'foto']])]);
   assert.equal(applied, 1); assert.equal(dirty, 1); assert.match(message, /Nenhum arquivo XML/);
 });

}
