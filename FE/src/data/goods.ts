/**
 * 굿즈 목록 — **임시 정적 데이터**.
 *
 * ⚠️ BE 에 굿즈 도메인이 없습니다 (개편 3단계에서 계약 추가).
 * ⚠️ **가격은 표시 전용**입니다. 플랫폼은 금전 거래를 중개하지 않습니다.
 *    `shopUrl` 은 공식 판매처 외부 링크입니다.
 */

export const GOODS_CATEGORIES = [
  "light",
  "apparel",
  "photo",
  "living",
] as const;
export type GoodsCategory = (typeof GOODS_CATEGORIES)[number];

export type Goods = {
  id: number;
  name: string;
  price: number;
  category: GoodsCategory;
  description: string;
  shopUrl: string;
  /** 인기 TOP 4 에 노출할지 */
  popular: boolean;
};

export const GOODS: Goods[] = [
  {
    id: 1,
    name: "공식 응원봉",
    price: 35000,
    category: "light",
    popular: true,
    description: "공연장에서 쓰는 공식 응원봉입니다. 배터리 별매.",
    shopUrl: "https://www.mbn.co.kr",
  },
  {
    id: 2,
    name: "응원 슬로건",
    price: 30000,
    category: "photo",
    popular: true,
    description: "양면 인쇄 슬로건. 공연장 반입 가능 규격입니다.",
    shopUrl: "https://www.mbn.co.kr",
  },
  {
    id: 3,
    name: "응원 파우치",
    price: 14000,
    category: "living",
    popular: true,
    description: "지퍼형 파우치. 소지품 수납용입니다.",
    shopUrl: "https://www.mbn.co.kr",
  },
  {
    id: 4,
    name: "응원 키링",
    price: 12000,
    category: "living",
    popular: true,
    description: "아크릴 키링. 가방·열쇠고리에 답니다.",
    shopUrl: "https://www.mbn.co.kr",
  },
  {
    id: 5,
    name: "콘서트 티셔츠",
    price: 29000,
    category: "apparel",
    popular: false,
    description: "면 100% 반팔 티셔츠. S~XL.",
    shopUrl: "https://www.mbn.co.kr",
  },
  {
    id: 6,
    name: "포토카드 세트",
    price: 18000,
    category: "photo",
    popular: false,
    description: "포토카드 8종 세트입니다.",
    shopUrl: "https://www.mbn.co.kr",
  },
  {
    id: 7,
    name: "응원 타월",
    price: 20000,
    category: "apparel",
    popular: false,
    description: "공연용 응원 타월입니다.",
    shopUrl: "https://www.mbn.co.kr",
  },
  {
    id: 8,
    name: "머그컵",
    price: 16000,
    category: "living",
    popular: false,
    description: "세라믹 머그컵 350ml.",
    shopUrl: "https://www.mbn.co.kr",
  },
];

export function findGoods(id: number): Goods | undefined {
  return GOODS.find((g) => g.id === id);
}

/** 카테고리별로 묶습니다 — 굿즈 탭 하단이 카테고리 단위로 나뉩니다. */
export function goodsByCategory(): {
  category: GoodsCategory;
  items: Goods[];
}[] {
  return GOODS_CATEGORIES.map((category) => ({
    category,
    items: GOODS.filter((g) => g.category === category),
  })).filter((group) => group.items.length > 0);
}
