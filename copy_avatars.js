import { copyFileSync } from 'fs';
const src1 = 'C:/Users/LENOVO/.gemini/antigravity/brain/dbb265e4-f9c5-4c42-a9a1-4eac647ea907/instructor_avatar_1776534729761.png';
const dst1 = 'frontend/src/components/AgentSelect/instructor_avatar.png';
const src2 = 'C:/Users/LENOVO/.gemini/antigravity/brain/dbb265e4-f9c5-4c42-a9a1-4eac647ea907/assistant_avatar_1776534746113.png';
const dst2 = 'frontend/src/components/AgentSelect/assistant_avatar.png';
copyFileSync(src1, dst1);
copyFileSync(src2, dst2);
console.log('Avatars copied successfully');
