# VAFPQR Local Development Restart Guide

이 문서는 저장소 정리 후 로컬에서 프로젝트를 다시 실행할 때 필요한 작업만 정리한 가이드입니다.

## 정리 과정에서 제거되는 로컬 생성물

다음 항목은 소스 코드가 아니며 필요할 때 다시 생성할 수 있습니다.

| 제거 항목 | 다시 만드는 방법 |
|---|---|
| 모든 `node_modules/` | 저장소 루트에서 `npm install` |
| `mobile-app/.expo/` | Expo 실행 시 자동 생성 |
| `admin-web/dist/` | `npm run build:admin` |
| `landing-web/dist/` | `npm run build:landing` |
| `backend/admin-dist/` | Admin 빌드 결과를 복사하거나 Render 빌드 사용 |
| `backend/landing-dist/` | Landing 빌드 결과를 복사하거나 Render 빌드 사용 |
| `mobile-app/dist/*.apk` | 기존 GitHub Release 사용 또는 EAS에서 새 빌드 |

다음 항목은 제거하지 않습니다.

- `backend/.env`
- `mobile-app/.env`
- `mobile-app/android/` 네이티브 소스
- Supabase 데이터
- Render 환경변수와 배포 설정
- Git 기록과 공개 GitHub Release

## 1. 필수 도구 확인

권장 환경:

- Node.js 20.19 이상
- npm
- Git
- Android 휴대폰
- Metro 테스트용 Development Client APK

버전을 확인합니다.

```bash
node --version
npm --version
git --version
```

Android SDK Platform이나 PC의 전역 Gradle 캐시는 이번 정리에서 삭제하지 않으므로 다시 설치할 필요가 없습니다.

## 2. 전체 의존성 다시 설치

Git Bash에서 저장소 루트로 이동합니다.

```bash
cd ~/Desktop/GitHub/ICT302
npm install
```

이 프로젝트에서는 Git Bash 사용을 권장합니다. PowerShell에서 `npm`이
`AppData/Roaming/npm` 경로의 module 오류를 표시하면 PowerShell용 실행 파일을
명시합니다.

```powershell
npm.cmd install
```

같은 문제가 `npx`에서 발생하면 `npx.cmd`를 사용합니다.

루트 npm workspace가 다음 네 프로젝트의 의존성을 설치합니다.

- `backend`
- `landing-web`
- `admin-web`
- `mobile-app`

설치 후 Prisma Client를 명시적으로 다시 생성하려면 다음을 실행합니다.

```bash
cd ~/Desktop/GitHub/ICT302/backend
npx prisma generate
```

단순 실행을 위해 `prisma db push`나 migration 명령을 다시 실행할 필요는 없습니다. 데이터베이스 스키마를 실제로 변경했을 때만 별도로 수행합니다.

## 3. 환경 파일 확인

기존 로컬 `.env` 파일은 정리 과정에서 삭제하지 않습니다.

Backend 확인 위치:

```text
backend/.env
```

필요한 변수 이름:

```text
DATABASE_URL
DIRECT_URL
QR_JWT_SECRET
AUTH_JWT_SECRET
ADMIN_EMAIL
ADMIN_PASSWORD
SUPABASE_URL
SUPABASE_SERVICE_KEY
APK_DOWNLOAD_URL
```

Mobile 확인 위치:

```text
mobile-app/.env
```

필요한 값:

```text
EXPO_PUBLIC_API_BASE_URL=https://ict302-b77o.onrender.com
```

실제 비밀번호, JWT secret, Supabase key는 이 문서나 Git에 작성하지 않습니다.

## 4. Backend 실행

새 Git Bash 터미널에서 실행합니다.

```bash
cd ~/Desktop/GitHub/ICT302
npm run start:backend
```

기본 로컬 API 주소:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/api/health
```

Render의 운영 API를 사용하는 모바일 테스트라면 로컬 Backend를 실행하지 않아도 됩니다.

## 5. Admin Web 실행

별도 터미널에서 실행합니다.

```bash
cd ~/Desktop/GitHub/ICT302
npm run dev:admin
```

Vite가 표시하는 로컬 URL을 브라우저에서 엽니다. 개발 서버는 `/api` 요청을 로컬 Backend로 프록시합니다.

## 6. Landing Web 실행

별도 터미널에서 실행합니다.

```bash
cd ~/Desktop/GitHub/ICT302
npm run dev:landing
```

Landing Page를 직접 확인할 때는 상태 query parameter를 사용할 수 있습니다.

```text
/?status=valid
/?status=expired
/?status=invalid
/?status=suspicious
/?status=blacklisted
```

## 7. Mobile App을 Metro에 연결

휴대폰에 Development Client APK가 설치되어 있어야 합니다. Git Bash에서 실행합니다.

```bash
cd ~/Desktop/GitHub/ICT302/mobile-app
npx expo start --dev-client -c
```

그다음 휴대폰의 Development Client에서 Metro QR을 스캔합니다.

주의:

- GitHub Release에서 받은 일반 Preview/Release APK는 Metro 개발자 화면에 연결되지 않습니다.
- `-c`는 Metro 캐시를 초기화합니다.
- PC와 휴대폰이 같은 네트워크에 있어야 LAN 연결이 쉽습니다.
- 앱 API는 `EXPO_PUBLIC_API_BASE_URL`에 설정된 Render 주소를 사용합니다.

Development Client가 휴대폰에 없다면 새로 빌드합니다.

```bash
cd ~/Desktop/GitHub/ICT302/mobile-app
npx eas-cli@latest build --platform android --profile development
```

전역 EAS CLI가 설치되어 있다면 다음 명령도 사용할 수 있습니다.

```bash
eas build --platform android --profile development
```

## 8. Web Production Build 다시 만들기

Admin과 Landing의 `dist/`가 필요하면 저장소 루트에서 실행합니다.

```bash
cd ~/Desktop/GitHub/ICT302
npm run build:web
```

각각 따로 빌드할 수도 있습니다.

```bash
npm run build:admin
npm run build:landing
```

Render는 배포 과정에서 두 웹 앱을 빌드하고 결과를 Backend의 `admin-dist/`와 `landing-dist/`로 복사합니다. 따라서 로컬 생성 폴더를 삭제해도 현재 Render 서비스에는 영향이 없습니다.

## 9. 새 Preview APK가 필요한 경우

코드가 변경되지 않았다면 기존 공개 APK를 계속 사용할 수 있습니다.

새 APK가 필요할 때만 실행합니다.

```bash
cd ~/Desktop/GitHub/ICT302/mobile-app
npx eas-cli@latest build --platform android --profile preview
```

현재 공개 Release:

```text
https://github.com/RoyYoo716/ICT302/releases/tag/mobile-v0.1.0
```

## 10. 일반적인 복구 명령

패키지를 찾지 못하는 경우:

```bash
cd ~/Desktop/GitHub/ICT302
npm install
```

Expo 연결이나 번들 캐시 문제가 있는 경우:

```bash
cd ~/Desktop/GitHub/ICT302/mobile-app
npx expo start --dev-client -c
```

Expo 프로젝트 설정을 검사하려면:

```bash
cd ~/Desktop/GitHub/ICT302/mobile-app
npx expo-doctor
```

Prisma Client 관련 오류가 발생하면:

```bash
cd ~/Desktop/GitHub/ICT302/backend
npx prisma generate
```

## 11. 실행 전 최종 확인

- [ ] 루트에서 `npm install` 완료
- [ ] `backend/.env` 존재
- [ ] `mobile-app/.env` 존재
- [ ] Backend Health check 성공
- [ ] Admin Web 로그인 화면 표시
- [ ] Landing 상태별 화면 표시
- [ ] 휴대폰에 Development Client 설치
- [ ] Metro 실행 시 `--dev-client -c` 사용
- [ ] Release APK와 Development Client의 차이 확인

정리 이후 일반적인 로컬 재시작에 필요한 핵심 작업은 `npm install`, `npx prisma generate`, 그리고 필요한 각 개발 서버 실행입니다.
