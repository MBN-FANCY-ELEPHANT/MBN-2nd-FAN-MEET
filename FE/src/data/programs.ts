/**
 * MBN 방송 프로그램 · 출연자 명단 — 랜딩페이지 데이터.
 *
 * ⚠️ **임시 정적 데이터입니다.** 레이아웃 개편 1차(FE 페이지 개편) 단계라 BE 계약이
 *    아직 없습니다. 기능 개편 방향이 확정되면(2단계) `docs/api-spec.yaml` 에
 *    프로그램·출연자 엔드포인트를 추가하고 이 파일을 걷어내세요.
 *
 * ⚠️ 프로그램명·출연자명은 **고유명사라 i18n 대상이 아닙니다.** UI 문구만 `t()` 를 씁니다
 *    (기존 코드가 "MBN" 을 리터럴로 두는 것과 같은 처리). 대신 프로그램은 `titleEn` 을
 *    함께 두어 한국어가 아닌 로케일에서 로마자 표기를 보여줍니다.
 */

export const PROGRAM_CATEGORIES = ["COMPETITION", "MUSIC_SHOW"] as const;
export type ProgramCategory = (typeof PROGRAM_CATEGORIES)[number];

export type CastGroup = {
  /** 시즌·국가·역할 구분 라벨 */
  label: string;
  labelEn: string;
  members: string[];
};

export type Program = {
  id: string;
  title: string;
  titleEn: string;
  category: ProgramCategory;
  groups: CastGroup[];
};

export const PROGRAMS: Program[] = [
  {
    id: "hanil-topten",
    title: "한일톱텐쇼",
    titleEn: "Hanil Top Ten Show",
    category: "MUSIC_SHOW",
    groups: [
      {
        label: "시즌 1 한국 대표 TOP7",
        labelEn: "Season 1 · Korea TOP7",
        members: [
          "린",
          "전유진",
          "마이진",
          "별사랑",
          "김다현",
          "박혜신",
          "마리아 리스",
        ],
      },
      {
        label: "시즌 1 일본 대표 TOP7",
        labelEn: "Season 1 · Japan TOP7",
        members: [
          "후쿠다 미라이",
          "우타고코로 리에",
          "아즈마 아키",
          "마코토",
          "스미다 아이코",
          "카노 미유",
          "나츠코",
        ],
      },
      {
        label: "시즌 2 한국",
        labelEn: "Season 2 · Korea",
        members: [
          "박서진",
          "진해성",
          "에녹",
          "신승태",
          "김준수",
          "최수호",
          "황민호",
        ],
      },
      {
        label: "시즌 2 일본",
        labelEn: "Season 2 · Japan",
        members: ["타케나카 유다이", "마사야", "타쿠야", "주니", "슈", "신"],
      },
    ],
  },
  {
    id: "hanil-gawang",
    title: "한일가왕전",
    titleEn: "Hanil Gawangjeon",
    category: "COMPETITION",
    groups: [
      {
        label: "2024 한국",
        labelEn: "2024 · Korea",
        members: [
          "전유진",
          "마이진",
          "별사랑",
          "박혜신",
          "린",
          "마리아 리스",
          "김다현",
        ],
      },
      {
        label: "2024 일본",
        labelEn: "2024 · Japan",
        members: [
          "후쿠다 미라이",
          "우타고코로 리에",
          "아즈마 아키",
          "마코토",
          "스미다 아이코",
          "카노 미유",
          "나츠코",
        ],
      },
      {
        label: "2025 한국",
        labelEn: "2025 · Korea",
        members: [
          "박서진",
          "진해성",
          "에녹",
          "신승태",
          "김준수",
          "최수호",
          "강문경",
        ],
      },
      {
        label: "2025 일본",
        labelEn: "2025 · Japan",
        members: [
          "타케나카 유다이",
          "마사야",
          "타쿠야",
          "Juni",
          "슈",
          "키모토 신노스케",
          "신",
        ],
      },
      {
        label: "2026 한국 TOP7",
        labelEn: "2026 · Korea TOP7",
        members: [
          "홍지윤",
          "차지연",
          "이수연",
          "구수경",
          "강혜연",
          "김태연",
          "솔지",
        ],
      },
      {
        label: "2026 일본 TOP7",
        labelEn: "2026 · Japan TOP7",
        members: [
          "나가이 마나미",
          "나탈리아 D",
          "아라카와 카렌",
          "아즈마 아키",
          "본 이노우에",
          "시모키타 히나",
          "타에 리",
        ],
      },
      {
        label: "2026 한일멘토단",
        labelEn: "2026 · Mentors",
        members: [
          "설운도",
          "정수라",
          "강남",
          "린",
          "전유진",
          "박서진",
          "김수찬",
          "나카시마 미카",
          "타케나카 유다이",
          "미나미노 요코",
          "Kawang",
        ],
      },
    ],
  },
  {
    id: "hyeonyeok-gawang-2",
    title: "현역가왕2",
    titleEn: "Hyeonyeok Gawang 2",
    category: "COMPETITION",
    groups: [
      {
        label: "TOP7 최종 진출자",
        labelEn: "TOP7 Finalists",
        members: [
          "박서진",
          "진해성",
          "에녹",
          "신승태",
          "김준수",
          "최수호",
          "황민호",
        ],
      },
      {
        label: "전체 참가자 34인",
        labelEn: "All 34 Contestants",
        members: [
          "강문경",
          "강설민",
          "곽영광",
          "공훈",
          "나태주",
          "나카자와 타쿠야",
          "노지훈",
          "박구윤",
          "박준영",
          "송민준",
          "승국이",
          "신승태",
          "양지원",
          "에녹",
          "윤준협",
          "이현승",
          "전종혁",
          "정다한",
          "재하",
          "진해성",
          "김경민",
          "김수찬",
          "김영철",
          "김준수",
          "김중연",
          "김호연",
          "최수호",
          "최우진",
          "효성",
          "황민호",
          "환희",
          "한강",
          "성리",
          "유민",
        ],
      },
    ],
  },
  {
    id: "burning-trotman",
    title: "불타는 트롯맨",
    titleEn: "Burning Trotman",
    category: "COMPETITION",
    groups: [
      {
        label: "MC · 심사위원",
        labelEn: "MC & Judges",
        members: [
          "도경완",
          "남진",
          "심수봉",
          "설운도",
          "주현미",
          "조항조",
          "김용임",
          "윤일상",
          "윤명선",
          "이석훈",
          "김준수",
          "신유",
          "박현빈",
          "이지혜",
          "김호영",
          "홍진영",
          "조정민",
          "유빈",
        ],
      },
      {
        label: "TOP7",
        labelEn: "TOP7",
        members: [
          "손태진",
          "신성(신동곤)",
          "에녹",
          "안율",
          "임도형",
          "전종혁",
          "정다한",
        ],
      },
      {
        label: "주요 참가자",
        labelEn: "Contestants",
        members: [
          "조동환",
          "김세진",
          "김승국",
          "명도(조대호, 안창민)",
          "최민우",
          "구성준",
          "이성훈",
          "유한솔",
          "송성호",
          "채일",
          "김광호",
          "오혜빈",
          "강예성",
          "브론즈 펠레",
          "김태원",
          "양승호",
          "김민형",
          "강민수",
          "이강민",
          "백결",
          "임성현",
          "이후림",
          "정준교",
          "태백",
          "이승현",
          "박민호",
          "홍석훈",
          "춘길",
          "김재희",
          "조주한",
          "신명근",
          "펑크리얼무브",
          "박정훈",
          "라오니엘",
          "김정훈",
          "최용호",
          "김첼로",
          "홍성원",
          "정윤서",
          "박정서",
          "최지욱",
          "도유민",
          "정영우",
          "한태현",
          "김정민",
          "박민수",
          "이승환",
          "황영웅",
          "장동일",
          "홍지호",
          "김태수",
          "이수호",
          "김희석",
          "박재원",
          "오송",
          "이아평",
          "강설민",
          "안훈",
          "최정훈",
          "박현호",
          "정해준",
          "김중연",
          "공훈",
          "송우주",
          "한상귀",
          "각오빠",
          "최성",
          "김재혁",
          "남궁문정",
          "최순호",
          "이세찬",
          "황준",
          "금강",
          "최윤아",
          "홍예성",
          "남승민",
          "최상",
          "한강",
          "최현상",
          "강훈",
          "박규선",
          "성용하",
          "민수현",
          "무룡",
          "재웅",
          "선경",
          "홍원빈",
          "징일송",
          "정의송",
          "불타는소년단",
        ],
      },
    ],
  },
  {
    id: "voice-trot",
    title: "보이스트롯",
    titleEn: "Voice Trot",
    category: "COMPETITION",
    groups: [
      {
        label: "배우 출연자",
        labelEn: "Actors",
        members: [
          "강성진",
          "김민희",
          "김보성",
          "김지우",
          "노현희",
          "문용현",
          "문희경",
          "박광현",
          "박상면",
          "박세욱",
          "박희진",
          "변우민",
          "서현석",
          "양금석",
          "안연홍",
          "이건주",
          "이동준",
          "이상인",
          "선우",
          "전원주",
          "정동남",
          "채영인",
          "백봉기",
          "신신애",
          "안소영",
          "유퉁",
          "이한위",
          "최준용",
          "배도환",
        ],
      },
      {
        label: "가수 · 연예인 출연자",
        labelEn: "Singers & Entertainers",
        members: [
          "김다현",
          "김성리",
          "김태연",
          "슬리피",
          "김창열",
          "김현민",
          "노유민",
          "선율",
          "심신",
          "안희정",
          "조문근",
          "채연",
          "최성욱",
          "하이디",
          "하현곤",
          "호란",
          "반형문",
          "모니카",
          "달수빈",
          "정민",
          "하리수",
          "홍경민",
          "윤택",
          "이동윤",
          "추대엽",
          "손헌수",
          "윤형빈",
          "대도서관",
          "도티",
          "안지환",
          "엄영수",
          "이만기",
          "김재엽",
          "김종양",
          "김학도",
          "김현욱",
          "니카",
          "박기량",
          "박상우",
          "방서희",
          "배소빈",
          "서주형",
          "서태훈",
          "성리",
          "신수지",
          "심형래",
          "태미",
        ],
      },
    ],
  },
  {
    id: "trot-fighter",
    title: "트롯파이터",
    titleEn: "Trot Fighter",
    category: "COMPETITION",
    groups: [
      {
        label: "완판기획",
        labelEn: "Wanpan Team",
        members: [
          "박현빈",
          "백봉기",
          "박세욱",
          "슬리피",
          "박광현",
          "박상우",
          "문희경",
          "성리",
          "박준영",
        ],
      },
      {
        label: "짬뽕기획",
        labelEn: "Jjamppong Team",
        members: [
          "진성",
          "김창렬",
          "손헌수",
          "조문근",
          "김현민",
          "황민우",
          "황민호",
          "이만기",
          "선율",
        ],
      },
    ],
  },
  {
    id: "our-trot",
    title: "우리들의 트로트 / 우리들의 남진",
    titleEn: "Our Trot / Our Nam Jin",
    category: "MUSIC_SHOW",
    groups: [
      {
        label: "MC",
        labelEn: "MC",
        members: ["붐", "장민호", "정동원"],
      },
      {
        label: "출연진",
        labelEn: "Cast",
        members: [
          "설운도",
          "강진",
          "진성",
          "조항조",
          "박현빈",
          "박구윤",
          "김희재",
          "황윤성",
          "나태주",
          "신승태",
          "양지원",
          "김수희",
          "김용임",
          "서지오",
          "조정민",
          "윤수현",
          "김나희",
          "강혜연",
          "허찬미",
          "윤태화",
          "전유진",
          "김유하",
        ],
      },
    ],
  },
  {
    id: "life-album",
    title: "인생앨범-예스터데이",
    titleEn: "Life Album - Yesterday",
    category: "MUSIC_SHOW",
    groups: [
      {
        label: "주요 출연진",
        labelEn: "Main Cast",
        members: [
          "설운도",
          "주현미",
          "윤명선",
          "박현빈",
          "대성",
          "강남",
          "장영란",
          "이지혜",
          "린",
          "전유진",
          "김다현",
          "마이진",
          "계은숙",
          "남진",
        ],
      },
    ],
  },
  {
    id: "avatar-singer",
    title: "아바타싱어",
    titleEn: "Avatar Singer",
    category: "COMPETITION",
    // 원본 자료에 출연자 명단이 없습니다. 확보되면 groups 에 추가하세요.
    groups: [],
  },
];

/** 프로그램 전체 출연자를 그룹 순서대로 펼치되 중복 이름은 처음 것만 남깁니다. */
export function castOf(program: Program): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const group of program.groups) {
    for (const name of group.members) {
      if (!seen.has(name)) {
        seen.add(name);
        result.push(name);
      }
    }
  }
  return result;
}

export type ArtistHit = {
  name: string;
  /** 이 아티스트가 출연한 프로그램 제목 (중복 출연이 흔합니다 — 린·전유진·박서진 등) */
  programs: string[];
};

/**
 * 이름 부분일치 검색.
 *
 * 출연자가 300명 가까이라 프로그램을 하나씩 펼쳐 찾는 건 현실적이지 않습니다.
 * 이름을 아는 팬에게는 검색이 유일하게 빠른 경로입니다.
 */
export function searchArtists(query: string): ArtistHit[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const byName = new Map<string, string[]>();
  for (const program of PROGRAMS) {
    for (const name of castOf(program)) {
      if (!name.toLowerCase().includes(q)) continue;
      const found = byName.get(name);
      if (found) {
        found.push(program.title);
      } else {
        byName.set(name, [program.title]);
      }
    }
  }
  return [...byName].map(([name, programs]) => ({ name, programs }));
}
