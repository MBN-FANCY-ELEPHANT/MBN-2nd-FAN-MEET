import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // 개발 중에는 프록시로 동일 오리진처럼 동작시켜 CORS 이슈를 없앱니다.
    // 프로덕션 배포 시에는 VITE_API_BASE_URL 로 백엔드 주소를 주입하세요.
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
});
