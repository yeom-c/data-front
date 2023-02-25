## [Quasar Data Front](https://data.quasar-gamestudio.ga)

### 소개
> Quasar Data Tool 의 Vue 3 Frontend 프로젝트
- [Vue 3](https://vuejs.org)
- [Pinia](https://pinia.vuejs.org/)
- [Naive UI](https://www.naiveui.com/en-US/os-theme)
- [Xicons](https://www.xicons.org)

### 구조
```
- src
 - assets
   : 이미지, css, font 등의 자원
 - components
   : 공통으로 사용되는 vue component
 - layouts
   : 각 페이지에서 사용되는 layout
 - requests
   : axios 요청
 - router
   : sidebar 메뉴 구성에 맞게 분리한 route
 - stores
   : state 관리를 위한 pinia store
 - utils
   : 공통으로 사용되는 함수
 - views
   : vue 화면 페이지
```

### 시작하기
```bash
# 프로젝트 클론
git clone git@github.com:quasargamestudio/quasar-data-front.git

# 프로젝트 폴더로 이동
cd quasar-data-front

# .env 파일 복사 후 열어서 자신의 환경에 맞게 변수 설정
cp .env.example .env

# 의존성 패키지 설치
npm install

# 실행
npm run dev
```

### 배포
- main 브랜치에 push 할 경우 develop 환경에 배포
