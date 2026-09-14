const state = {
  text: '',
  name: '陶泊妍',
  role: 'Artist · Creative Technologist · Visual Practitioner',
  slogan: '以雕塑语言探讨人与机器、空间与记忆的关系。',
};

const sectionMap = {
  basicInfo: document.getElementById('basicInfoGrid'),
  profilePanel: document.getElementById('profilePanel'),
  educationList: document.getElementById('educationList'),
  exhibitionGrid: document.getElementById('exhibitionGrid'),
  awardsList: document.getElementById('awardsList'),
  internshipList: document.getElementById('internshipList'),
  researchList: document.getElementById('researchList'),
  skillsGrid: document.getElementById('skillsGrid'),
};

function normalizeText(value) {
  return value.replace(/\r/g, '').trim();
}

function splitContent(text) {
  return normalizeText(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseNameAndContact(lines) {
  const name = lines.find((line) => /^#\s*/.test(line))?.replace(/^#\s*/, '') || '陶泊妍';
  const cleanName = lines.find((line) => !/^#/.test(line) && !line.startsWith('电话') && !line.startsWith('邮箱') && !line.startsWith('地址') && !line.includes('教育背景') && !line.includes('展览与竞赛') && !line.includes('实习经历') && !line.includes('额外奖项')) || '陶泊妍';

  const phone = lines.find((line) => line.includes('电话'))?.replace(/.*电话：?/, '') || '+86-135-5554-1343';
  const email = lines.find((line) => line.includes('邮箱'))?.replace(/.*邮箱：?/, '') || '1243217647@qq.com';
  const address = lines.find((line) => line.includes('地址'))?.replace(/.*地址：?/, '') || '中国黑龙江省大庆市龙凤区（邮编：163710）';

  return {
    name: cleanName || name || '陶泊妍',
    phone,
    email,
    address,
  };
}

function buildInfoCards(data) {
  const items = [
    { title: 'Phone', value: data.phone },
    { title: 'Email', value: data.email },
    { title: 'Location', value: data.address },
    { title: 'Focus', value: 'Sculpture / Installation / Visual Communication' },
  ];

  sectionMap.basicInfo.innerHTML = items
    .map(
      (item) => `
        <article class="info-card">
          <h3>${item.title}</h3>
          <p>${item.value}</p>
        </article>
      `
    )
    .join('');
}

function buildProfilePanel() {
  const profile = [
    '陶泊妍的创作围绕算法凝视、身体感知与数字权力关系展开，借助雕塑、光影与交互装置将抽象的技术议题具象化。',
    '作品以现象观察与材料实验为核心，关注人机关系、传播结构与个体主体性如何在当代城市语境中被塑造与重构。',
    '她同时参与品牌传播、城市公共艺术与新媒体叙事，致力于把专业艺术实践转译为清晰、具传播力的公众叙事。',
  ];

  const bullets = [
    'Interactive installation design',
    'Algorithmic culture & digital agency',
    'Public art & audience experience',
  ];

  sectionMap.profilePanel.innerHTML = `
    <p>${profile[0]} ${profile[1]} ${profile[2]}</p>
    <ul>
      ${bullets.map((item) => `<li>${item}</li>`).join('')}
    </ul>
  `;
}

function parseEducation(lines) {
  const sliceStart = lines.findIndex((line) => line.includes('教育背景'));
  const sliceEnd = lines.findIndex((line, index) => index > sliceStart && /^(展览与竞赛|实习经历|额外奖项|研究|项目|Academic)/.test(line));
  const relevant = lines.slice(sliceStart + 1, sliceEnd > -1 ? sliceEnd : lines.length);

  const cards = [];
  let current = null;

  relevant.forEach((line) => {
    if (/^[\u4e00-\u9fffA-Za-z].*\d{2,4}\/\d{2,4}-\d{2,4}\/\d{2,4}/.test(line)) {
      if (current) cards.push(current);
      current = { title: line, details: [] };
      return;
    }

    if (current && /^•|◆|\d+\.|-/.test(line)) {
      current.details.push(line.replace(/^•|◆|\d+\.|-\s*/, '').trim());
    }
  });

  if (current) cards.push(current);

  if (!cards.length) {
    cards.push({
      title: '岭南大学 09/2026-06/2027',
      details: ['商学院', '学位：艺术科技与商业理学硕士学位'],
    });
    cards.push({
      title: '南开大学滨海学院 09/2020-06/2024',
      details: ['艺术系', '学位：雕塑专业文学学士 | 平均绩点：77.8/100'],
    });
  }

  return cards;
}

function buildEducation(items) {
  sectionMap.educationList.innerHTML = items
    .map(
      (item) => `
        <article class="timeline-item">
          <div class="period">${item.title.split(/\s+/).slice(-1)[0] || item.title}</div>
          <div>
            <h3>${item.title}</h3>
            <strong>${item.title.includes('岭南') ? '岭南大学' : '南开大学滨海学院'}</strong>
            <p>${item.details.join(' · ')}</p>
          </div>
        </article>
      `
    )
    .join('');
}

function parseExhibitions(lines) {
  const start = lines.findIndex((line) => line.includes('展览与竞赛'));
  const end = lines.findIndex((line, index) => index > start && /^(实习经历|额外奖项|Academic|Research)/.test(line));
  const relevant = lines.slice(start + 1, end > -1 ? end : lines.length);

  const items = [];
  let current = null;

  relevant.forEach((line) => {
    if (/^创作者|^作者/.test(line) || /\d{4} 年/.test(line)) {
      if (current) items.push(current);
      current = { title: '', tag: '', period: '', details: [] };
    }

    if (current && /创作者|作者/.test(line)) {
      current.title = line.replace(/^(创作者|作者，?)\s*/, '').replace(/\s*——.*$/, '');
      current.tag = 'Exhibition';
      const periodMatch = line.match(/(\d{4}.*?\d{4}|\d{2}\/\d{4}-\d{2}\/\d{4})/);
      if (periodMatch) current.period = periodMatch[0];
      return;
    }

    if (current && /\d{4} 年|\d{2}\/\d{4}-\d{2}\/\d{4}/.test(line)) {
      current.period = line;
      return;
    }

    if (current && /^◆|\d+\.\s*/.test(line)) {
      current.details.push(line.replace(/^◆\s*|\d+\.\s*/, '').trim());
    }
  });

  if (current) items.push(current);

  if (!items.length) {
    items.push({
      title: 'GAZE',
      tag: 'Global Gold Award',
      period: '11/2024-05/2025',
      details: ['算法凝视与人机关系', 'TouchDesigner + OpenCV 实时交互系统', '视觉化数字权力关系研究'],
    });
  }

  return items.map((item) => ({
    title: item.title || 'GAZE',
    tag: item.tag || 'Exhibition',
    period: item.period || '2024-2025',
    details: item.details.length ? item.details.slice(0, 3) : ['创作与技术实验结合，聚焦算法、身体与空间感知。'],
  }));
}

function buildExhibitions(items) {
  sectionMap.exhibitionGrid.innerHTML = items
    .map(
      (item) => `
        <article class="exhibition-card">
          <div>
            <span class="work-tag">${item.tag}</span>
            <h3>${item.title}</h3>
            <p>${item.period}</p>
          </div>
          <ul>
            ${item.details.map((detail) => `<li>${detail}</li>`).join('')}
          </ul>
        </article>
      `
    )
    .join('');
}

function parseAwards(lines) {
  const start = lines.findIndex((line) => line.includes('额外奖项'));
  const end = lines.findIndex((line, index) => index > start && /^(实习经历|研究|项目|Academic|Professional)/.test(line));
  const relevant = lines.slice(start + 1, end > -1 ? end : lines.length);

  const items = [];
  relevant.forEach((line) => {
    if (line && !line.startsWith('•') && !line.startsWith('◆') && !line.startsWith('-') && !/^\d{4}/.test(line)) {
      return;
    }

    if (/\d{4}/.test(line)) {
      const match = line.match(/^(.*?)(\d{4}.*)$/);
      if (match) {
        const title = match[1].trim();
        const detail = match[2].trim();
        items.push({ title: title || 'Award', detail });
      }
    }
  });

  if (!items.length) {
    items.push({ title: '人民艺术青年第三届艺术创作活动', detail: '优秀作品奖' });
    items.push({ title: '2025年第七届香港当代设计大奖', detail: '铜奖' });
    items.push({ title: '南开大学滨海学院2024届毕业展', detail: '优秀奖' });
  }

  return items;
}

function buildAwards(items) {
  sectionMap.awardsList.innerHTML = items
    .map(
      (item) => `
        <article class="award-card">
          <span class="award-rank">Recognition</span>
          <h3>${item.title}</h3>
          <p>${item.detail}</p>
        </article>
      `
    )
    .join('');
}

function parseExperience(lines) {
  const start = lines.findIndex((line) => line.includes('实习经历'));
  const end = lines.findIndex((line, index) => index > start && /^(展览与竞赛|额外奖项|研究|项目|Academic|Professional)/.test(line));
  const relevant = lines.slice(start + 1, end > -1 ? end : lines.length);

  const entries = [];
  let current = null;

  relevant.forEach((line) => {
    if (line.includes('实习') || line.includes('有限公司') || line.includes('品牌传播部')) {
      if (current) entries.push(current);
      current = { company: line, role: '', period: '', details: [] };
      return;
    }

    if (current && /\d{2}\/\d{4}-\d{2}\/\d{4}/.test(line)) {
      current.period = line;
      return;
    }

    if (current && /^◆|\d+\.\s*/.test(line)) {
      current.details.push(line.replace(/^◆\s*|\d+\.\s*/, '').trim());
    }
  });

  if (current) entries.push(current);

  if (!entries.length) {
    entries.push({
      company: '哈尔滨滨海景观雕塑艺术有限公司',
      role: '品牌传播部实习生',
      period: '06/2023-07/2023',
      details: ['独立运营企业微信公众号、抖音及视频号矩阵', '策划城市艺术活动《冰城雕塑漫步计划》', '完成短视频制作与专业创作叙事输出'],
    });
  }

  return entries;
}

function buildExperience(items) {
  sectionMap.internshipList.innerHTML = items
    .map(
      (item) => `
        <article class="experience-card">
          <div class="experience-top">
            <strong>${item.company}</strong>
            <span>${item.period}</span>
          </div>
          <h3>${item.role}</h3>
          <ul>
            ${item.details.map((detail) => `<li>${detail}</li>`).join('')}
          </ul>
        </article>
      `
    )
    .join('');
}

function buildResearch() {
  const research = [
    {
      title: 'GAZE — 算法凝视与人机关系',
      period: '2024 – 2025',
      description: '围绕算法推荐机制与数据监视现象展开，构建交互装置来呈现观众行为在数字环境中的被感知与被反馈过程。',
      points: ['使用 TouchDesigner 与 OpenCV 建立实时交互系统', '模拟算法凝视机制中的反馈、聚焦与偏好塑造', '完成作品阐述报告并参与学术论坛交流'],
    },
    {
      title: 'You and Me — 爱与亲密关系',
      period: '2023',
      description: '探索跨文化语境下情感表达的共通性与多元性，并将东方线性美学转译为现代雕塑语言。',
      points: ['融合不锈钢、瓷器轮廓与光影机制', '强调人与人之间依存与独立的辩证关系', '致力于建立多语境下的视觉表达方式'],
    },
  ];

  sectionMap.researchList.innerHTML = research
    .map(
      (item) => `
        <article class="project-card">
          <div class="project-top">
            <strong>${item.title}</strong>
            <span>${item.period}</span>
          </div>
          <p>${item.description}</p>
          <ul>
            ${item.points.map((point) => `<li>${point}</li>`).join('')}
          </ul>
        </article>
      `
    )
    .join('');
}

function buildSkills() {
  const categories = [
    {
      title: 'Digital Art / Design',
      items: ['TouchDesigner', 'OpenCV', 'Python', 'Generative Visuals'],
    },
    {
      title: 'Sculpture',
      items: ['Material studies', 'Spatial composition', 'Light & shadow', 'Public art'],
    },
    {
      title: 'Media & Communication',
      items: ['Brand storytelling', 'Short video', 'WeChat / Douyin', 'Urban cultural campaigns'],
    },
    {
      title: 'Research & Practice',
      items: ['Curation', 'Art criticism', 'Audience research', 'Concept development'],
    },
  ];

  sectionMap.skillsGrid.innerHTML = categories
    .map(
      (category) => `
        <article class="skill-card">
          <h3>${category.title}</h3>
          <div class="skill-list">
            ${category.items.map((item) => `<span>${item}</span>`).join('')}
          </div>
        </article>
      `
    )
    .join('');
}

function setDynamicDetails() {
  const now = new Date();
  const year = now.getFullYear();
  document.getElementById('yearLabel').textContent = year;
  document.getElementById('lastUpdated').textContent = `Updated ${now.toISOString().slice(0, 10)}`;
}

function applyTheme() {
  const storedTheme = localStorage.getItem('resume-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = storedTheme || (prefersDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);

  const button = document.getElementById('themeToggle');
  const indicator = button.querySelector('.theme-indicator');
  indicator.textContent = theme === 'dark' ? '☾' : '☼';

  button.addEventListener('click', () => {
    const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('resume-theme', nextTheme);
    indicator.textContent = nextTheme === 'dark' ? '☾' : '☼';
  });
}

function bindPrintButton() {
  const printBtn = document.getElementById('printBtn');
  printBtn.addEventListener('click', () => window.print());
}

function bindRevealAnimation() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
}

async function loadCv() {
  try {
    const response = await fetch('./cv.md');
    if (!response.ok) {
      throw new Error('cv.md not found');
    }
    const text = await response.text();
    const lines = splitContent(text);
    const head = parseNameAndContact(lines);

    state.text = text;
    state.name = head.name;
    state.role = 'Artist · Creative Technologist · Visual Practitioner';
    state.slogan = '以雕塑语言探讨人与机器、空间与记忆的关系。';

    document.getElementById('hero-name').textContent = state.name;
    document.getElementById('hero-role').textContent = state.role;
    document.getElementById('hero-slogan').textContent = state.slogan;
    document.getElementById('portrait-identity').textContent = 'Sculpture / Media Art / Visual Communication';

    buildInfoCards(head);
    buildProfilePanel();
    buildEducation(parseEducation(lines));
    buildExhibitions(parseExhibitions(lines));
    buildAwards(parseAwards(lines));
    buildExperience(parseExperience(lines));
    buildResearch();
    buildSkills();
  } catch (error) {
    document.getElementById('hero-name').textContent = '陶泊妍';
    document.getElementById('hero-role').textContent = 'Artist · Creative Technologist · Visual Practitioner';
    document.getElementById('hero-slogan').textContent = '以雕塑语言探讨人与机器、空间与记忆的关系。';
    buildInfoCards({ phone: '+86-135-5554-1343', email: '1243217647@qq.com', address: '中国黑龙江省大庆市龙凤区（邮编：163710）' });
    buildProfilePanel();
    buildEducation(parseEducation(splitContent(`# cv\n陶泊妍\n电话：+86-135-5554-1343\n邮箱：1243217647@qq.com\n地址：中国黑龙江省大庆市龙凤区（邮编：163710）\n教育背景\n岭南大学 09/2026-06/2027\n• 商学院\n• 学位：艺术科技与商业理学硕士学位\n南开大学滨海学院 09/2020-06/2024\n• 艺术系\n• 学位：雕塑专业文学学士 | 平均绩点：77.8/100\n展览与竞赛\n创作者——2025 年 ART NOW 全球当代艺术与设计大赛——《GAZE》\n◆ ...`))); 
    buildExhibitions(parseExhibitions(splitContent(`# cv\n陶泊妍\n电话：+86-135-5554-1343\n邮箱：1243217647@qq.com\n地址：中国黑龙江省大庆市龙凤区（邮编：163710）\n教育背景\n岭南大学 09/2026-06/2027\n• 商学院\n• 学位：艺术科技与商业理学硕士学位\n南开大学滨海学院 09/2020-06/2024\n• 艺术系\n• 学位：雕塑专业文学学士 | 平均绩点：77.8/100\n展览与竞赛\n创作者——2025 年 ART NOW 全球当代艺术与设计大赛——《GAZE》\n◆ ...`)));
    buildAwards(parseAwards(splitContent(`# cv\n陶泊妍\n电话：+86-135-5554-1343\n邮箱：1243217647@qq.com\n地址：中国黑龙江省大庆市龙凤区（邮编：163710）\n教育背景\n岭南大学 09/2026-06/2027\n• 商学院\n• 学位：艺术科技与商业理学硕士学位\n南开大学滨海学院 09/2020-06/2024\n• 艺术系\n• 学位：雕塑专业文学学士 | 平均绩点：77.8/100\n展览与竞赛\n创作者——2025 年 ART NOW 全球当代艺术与设计大赛——《GAZE》\n◆ ...\n实习经历\n哈尔滨滨海景观雕塑艺术有限公司品牌传播部实习生\n◆ ...\n额外奖项\n人民艺术青年第三届艺术创作活动——优秀作品奖\n2025 年第七届香港当代设计大奖——铜奖\n南开大学滨海学院 2024 届毕业展——优秀奖`)));
    buildExperience(parseExperience(splitContent(`# cv\n陶泊妍\n电话：+86-135-5554-1343\n邮箱：1243217647@qq.com\n地址：中国黑龙江省大庆市龙凤区（邮编：163710）\n教育背景\n岭南大学 09/2026-06/2027\n• 商学院\n• 学位：艺术科技与商业理学硕士学位\n南开大学滨海学院 09/2020-06/2024\n• 艺术系\n• 学位：雕塑专业文学学士 | 平均绩点：77.8/100\n展览与竞赛\n创作者——2025 年 ART NOW 全球当代艺术与设计大赛——《GAZE》\n◆ ...\n实习经历\n哈尔滨滨海景观雕塑艺术有限公司品牌传播部实习生\n◆ ...\n额外奖项\n人民艺术青年第三届艺术创作活动——优秀作品奖\n2025 年第七届香港当代设计大奖——铜奖\n南开大学滨海学院 2024 届毕业展——优秀奖`)));
    buildResearch();
    buildSkills();
    console.warn('Fallback content rendered because cv.md could not be loaded.');
  } finally {
    bindRevealAnimation();
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  applyTheme();
  bindPrintButton();
  setDynamicDetails();
  await loadCv();
});
