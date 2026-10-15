import csv
import hashlib
import importlib.util
import tempfile
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("converter", Path(__file__).resolve().parents[1] / "scripts/kinghost-preparar-importacao.py")
converter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(converter)


class ImportTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.source = Path(self.temp.name) / "export.csv"
        self.target = Path(self.temp.name) / "import.sql"
        self.statements = ["BEGIN;", "SELECT 'João, d''Ávila';\n-- teste", "COMMIT; -- CABANA_EXPORT_COMPLETO"]

    def write_csv(self, mutate=lambda rows: None):
        rows = [[i, len(self.statements), sql, hashlib.md5(sql.encode()).hexdigest()]
                for i, sql in enumerate(self.statements, 1)]
        mutate(rows)
        with self.source.open("w", encoding="utf-8-sig", newline="") as handle:
            writer = csv.writer(handle)
            writer.writerow(["seq", "total", "sql", "md5"])
            writer.writerows(rows)

    def test_roundtrip_unicode_quotes_and_newlines(self):
        self.write_csv()
        self.assertEqual(converter.convert(self.source, self.target), 3)
        self.assertIn("\n".join(self.statements), self.target.read_text(encoding="utf-8"))
        with self.assertRaises(FileExistsError):
            converter.convert(self.source, self.target)

    def test_missing_rows(self):
        self.write_csv(lambda rows: rows.pop())
        with self.assertRaisesRegex(ValueError, "incompleta"):
            converter.convert(self.source, self.target)
        self.assertFalse(self.target.exists())

    def test_truncated_cell(self):
        self.write_csv(lambda rows: rows[1].__setitem__(2, "SELECT"))
        with self.assertRaisesRegex(ValueError, "truncado"):
            converter.convert(self.source, self.target)
        self.assertFalse(self.target.exists())

    def test_wrong_order(self):
        self.write_csv(lambda rows: rows.reverse())
        with self.assertRaisesRegex(ValueError, "ordem"):
            converter.convert(self.source, self.target)


if __name__ == "__main__":
    unittest.main()
