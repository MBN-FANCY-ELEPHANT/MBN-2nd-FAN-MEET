/**
 * 굿즈 목록 — **아티스트별 정적 데이터**.
 *
 * ⚠️ BE 에 굿즈 도메인이 없습니다. 그래서 **FE 배포만으로 전부 바뀝니다** —
 *    배포 백엔드나 DB 를 건드릴 수 없는 상황에서도 굿즈는 여기만 고치면 됩니다.
 *
 * ⚠️ **가격은 표시 전용**입니다. 플랫폼은 금전 거래를 중개하지 않습니다.
 *    `shopUrl` 은 공식 판매처 외부 링크입니다.
 *
 * ⚠️ 이미지는 `FE/public/artists/<slug>/goods/<image>` 에서 옵니다.
 *    파일이 없으면 `main.tsx` 의 전역 onError 가 예시 이미지로 폴백합니다.
 */

import { getSelectedArtist } from "../features/artist/selectedArtist";
import { ARTISTS } from "./programs";

export const GOODS_CATEGORIES = [
  "light",
  "apparel",
  "photo",
  "living",
] as const;
export type GoodsCategory = (typeof GOODS_CATEGORIES)[number];

export type Goods = {
  /** ⚠️ **전체에서 유일**해야 합니다. `/fanspace/goods/:id` 가 이 값으로 찾습니다. */
  id: number;
  name: string;
  price: number;
  category: GoodsCategory;
  description: string;
  shopUrl: string;
  /** 인기 TOP 4 에 노출할지 */
  popular: boolean;
  /** `public/artists/<slug>/goods/` 안의 파일명. 확장자까지 그대로 씁니다. */
  image: string;
  /** 어느 아티스트의 굿즈인지 — 이미지 경로를 만들 때 씁니다. */
  artist: string;
};

const SHOP_URL = "https://www.mbn.co.kr";

/**
 * 아티스트별 **실제 이미지 파일 목록** — `public/artists/<slug>/goods/` 안의 파일명.
 *
 * ⚠️ **여기 적힌 개수만큼만 굿즈가 뜹니다.** 파일을 더 넣거나 빼면 이 배열도 고치세요.
 *    `public/` 은 번들러가 훑지 않아 자동으로 알아낼 방법이 없습니다.
 *
 * ⚠️ **확장자를 파일 그대로** 적어야 합니다. 아티스트마다 `.jpg`/`.png` 가 섞여 있는데
 *    한쪽으로 통일해 적으면 없는 파일을 가리켜 조용히 폴백 이미지가 뜹니다.
 *
 * 품목·가격은 `CATALOG` 에서 **순서대로** 가져옵니다 (1번 파일 = 응원봉).
 */
const GOODS_FILES: Record<string, string[]> = {
  성리: ["goods-1.jpg", "goods-2.jpg", "goods-3.jpg", "goods-4.jpg"],
  이찬원: [
    "goods-1.jpg",
    "goods-2.jpg",
    "goods-3.jpg",
    "goods-4.jpg",
    "goods-5.png",
    "goods-6.png",
    "goods-7.png",
    "goods-8.png",
  ],
  박서진: [
    "goods-1.jpg",
    "goods-2.jpg",
    "goods-3.jpg",
    "goods-4.jpg",
    "goods-5.jpg",
  ],
};

/**
 * 아티스트별 굿즈. **id 대역을 나눠 씁니다** — 성리 1~19 · 이찬원 21~39 · 박서진 41~59.
 * 아티스트마다 1 부터 다시 매기면 상세 링크가 남의 굿즈를 엽니다.
 *
 * 이름은 아티스트를 타지 않게 두었습니다 ("공식 응원봉"). 실물 굿즈명이 정해지면
 * `CATALOG` 만 바꾸면 됩니다.
 */
const GOODS_BY_ARTIST: Record<string, Goods[]> = {
  성리: buildGoods("성리", 1),
  이찬원: buildGoods("이찬원", 21),
  박서진: buildGoods("박서진", 41),
};

/**
 * 굿즈 품목 카탈로그. 세 아티스트가 같은 구성을 씁니다.
 *
 * `popular: true` 인 앞 4종이 굿즈 탭 상단 "인기 TOP 4" 캐러셀에 노출됩니다 —
 * 이미지가 4장뿐인 아티스트도 캐러셀이 비지 않도록 앞쪽에 몰아두었습니다.
 */
function buildGoods(artist: string, base: number): Goods[] {
  const catalog: Omit<Goods, "id" | "artist" | "image">[] = [
    {
      name: "공식 응원봉",
      price: 35000,
      category: "light",
      popular: true,
      description: "공연장에서 쓰는 공식 응원봉입니다. 배터리 별매.",
      shopUrl: SHOP_URL,
    },
    {
      name: "응원 슬로건",
      price: 12000,
      category: "photo",
      popular: true,
      description: "공연장에서 드는 응원 슬로건입니다.",
      shopUrl: SHOP_URL,
    },
    {
      name: "응원 파우치",
      price: 18000,
      category: "living",
      popular: true,
      description: "소지품을 담는 파우치입니다.",
      shopUrl: SHOP_URL,
    },
    {
      name: "응원 키링",
      price: 9000,
      category: "living",
      popular: true,
      description: "가방에 다는 아크릴 키링입니다.",
      shopUrl: SHOP_URL,
    },
    {
      name: "콘서트 티셔츠",
      price: 32000,
      category: "apparel",
      popular: false,
      description: "투어 로고가 들어간 반팔 티셔츠입니다.",
      shopUrl: SHOP_URL,
    },
    {
      name: "포토카드 세트",
      price: 15000,
      category: "photo",
      popular: false,
      description: "미공개 컷이 포함된 포토카드 8종 세트입니다.",
      shopUrl: SHOP_URL,
    },
    {
      name: "응원 타월",
      price: 20000,
      category: "apparel",
      popular: false,
      description: "공연장에서 두르는 응원 타월입니다.",
      shopUrl: SHOP_URL,
    },
    {
      name: "머그컵",
      price: 16000,
      category: "living",
      popular: false,
      description: "로고가 새겨진 세라믹 머그컵입니다.",
      shopUrl: SHOP_URL,
    },
  ];

  const files = GOODS_FILES[artist] ?? [];
  // 파일이 있는 만큼만 만듭니다. 카탈로그보다 파일이 많으면 품목을 순환시킵니다.
  return files.map((image, index) => ({
    ...catalog[index % catalog.length],
    id: base + index,
    artist,
    image,
  }));
}

/** 굿즈 썸네일 경로. 아티스트 폴더 안의 `goods/` 하위에서 찾습니다. */
export function goodsImage(goods: Goods): string {
  const slug = ARTISTS.find((a) => a.name === goods.artist)?.slug;
  return slug ? `/artists/${slug}/goods/${goods.image}` : "/example_thumb.png";
}

/** 선택한 아티스트의 굿즈. 명단에 없으면 첫 아티스트로 폴백합니다. */
export function goodsForArtist(): Goods[] {
  const name = getSelectedArtist();
  return GOODS_BY_ARTIST[name ?? ""] ?? GOODS_BY_ARTIST[ARTISTS[0].name];
}

/**
 * `/fanspace/goods/:id` 로 들어온 굿즈를 찾습니다.
 *
 * ⚠️ 선택 아티스트뿐 아니라 **전체에서** 찾습니다. 링크를 공유받아 들어왔을 때
 * 선택이 달라도 그 굿즈가 열려야 합니다.
 */
export function findGoods(id: number): Goods | undefined {
  return Object.values(GOODS_BY_ARTIST)
    .flat()
    .find((g) => g.id === id);
}

/** 카테고리별로 묶습니다 — 굿즈 탭 하단이 카테고리 단위로 나뉩니다. */
export function goodsByCategory(): {
  category: GoodsCategory;
  items: Goods[];
}[] {
  const goods = goodsForArtist();
  return GOODS_CATEGORIES.map((category) => ({
    category,
    items: goods.filter((g) => g.category === category),
  })).filter((group) => group.items.length > 0);
}
