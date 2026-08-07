"""7개 로케일의 키 집합이 동일한지 확인합니다.

한쪽에만 키가 있으면 언어 전환 시 키 문자열이 화면에 그대로 노출됩니다 —
데모 중 가장 눈에 띄는 사고라 커밋 전에 한 번 돌려보세요.

    cd FE && python scripts/check-i18n.py

⚠️ 콘솔이 CP949 라 누락 키에 한글이 있으면 출력이 깨질 수 있습니다.
   키 이름은 ASCII 라 판독에는 문제가 없습니다.
"""

import io
import json
import os
import sys

LOCALES = ["ko", "en", "fr", "ja", "es", "zh", "ru"]
BASE = "ko"

HERE = os.path.dirname(os.path.abspath(__file__))
LOCALES_DIR = os.path.join(HERE, "..", "src", "i18n", "locales")


def flatten(node, prefix=""):
    """중첩 dict 를 'a.b.c' 형태의 키 집합으로 폅니다."""
    keys = set()
    for key, value in node.items():
        path = prefix + "." + key if prefix else key
        if isinstance(value, dict):
            keys |= flatten(value, path)
        else:
            keys.add(path)
    return keys


def main():
    sets = {}
    for locale in LOCALES:
        path = os.path.join(LOCALES_DIR, locale + ".json")
        with io.open(path, encoding="utf-8") as f:
            sets[locale] = flatten(json.load(f))

    base = sets[BASE]
    failed = False
    for locale in LOCALES:
        missing = sorted(base - sets[locale])
        extra = sorted(sets[locale] - base)
        if missing or extra:
            failed = True
            print("[%s] missing=%s extra=%s" % (locale, missing, extra))

    print("total keys: %d" % len(base))
    if failed:
        print("PARITY FAILED")
        return 1
    print("PARITY OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
