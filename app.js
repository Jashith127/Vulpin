const app = document.querySelector('#app');
const toast = document.querySelector('#toast');
const selectionMenu = document.querySelector('#selection-menu');

const state = {
  screen: 'login', setupStep: 1, deadline: '', depth: 3, depthSelected: false, goals: [], customGoal: '', editingSources: false,
  quizIndex: 0, answers: [], quizHint: false, quizWrong: [], quizRound: 1, quizShowHints: false, hintRevealed: false, relatedPanel: null, relatedPanelExpanded: false, panelType: 'related',
  sources: [
    { id: 1, type: 'PDF', title: 'Biology 2e — Photosynthesis', note: 'OpenStax · Chapter 8' },
    { id: 2, type: 'LINK', title: 'Photosynthesis in plants', note: 'Encyclopaedia Britannica' },
    { id: 3, type: 'VIDEO', title: 'How plants capture light', note: 'Khan Academy · 8 min' }
  ],
  panelExpanded: false, fullSource: false, selectedClaim: '', quizIndex: 0, answers: [], quizHint: false
};

const topics = [
  ['Photosynthesis', 'Biology · 5 tasks', 40],
  ['The French Revolution', 'History · 3 tasks', 70],
  ['Linear Algebra', 'Mathematics · 7 tasks', 15]
];

const quiz = [
  { q: 'Where do the light-dependent reactions occur?', options: ['In the thylakoid membrane', 'In the nucleus', 'In the cell wall', 'In the cytoplasm'], answer: 0, hint: 'Think about which organelle part is specialized for capturing light energy.' },
  { q: 'What molecule carries energy from the light reactions to the Calvin cycle?', options: ['ATP', 'DNA', 'Oxygen', 'Glucose only'], answer: 0, hint: 'This energy carrier is produced during the light-dependent reactions and used immediately in the Calvin cycle.' },
  { q: 'Which gas is absorbed during carbon fixation?', options: ['Carbon dioxide', 'Oxygen', 'Nitrogen', 'Hydrogen'], answer: 0, hint: 'Carbon fixation is the process of taking an inorganic gas and incorporating it into an organic molecule.' }
];

function icon(name, label = '') { return `<i class="icon ph ph-bold ph-${name}" aria-hidden="${label ? 'false' : 'true'}" ${label ? `aria-label="${label}" role="img"` : ''}></i>`; }
selectionMenu.innerHTML = `<button class="selection-menu-button" data-action="view-original"><span>View original</span>${icon('arrow-square-out')}</button>`;

function hideSelectionMenu() { selectionMenu.hidden = true; selectionMenu.style.removeProperty('left'); selectionMenu.style.removeProperty('top'); }
function showSelectionMenu() {
  const selection = window.getSelection();
  if (state.screen !== 'study' || !selection?.rangeCount || selection.isCollapsed) return hideSelectionMenu();
  const range = selection.getRangeAt(0);
  const lesson = app.querySelector('.lesson-reading') || app.querySelector('.evidence-reading');
  if (!lesson?.contains(range.commonAncestorContainer)) return hideSelectionMenu();
  const text = selection.toString().trim();
  if (!text) return hideSelectionMenu();
  const rect = range.getBoundingClientRect();
  if (!rect.width && !rect.height) return hideSelectionMenu();
  state.selectedClaim = text;
  const width = 146;
  const left = Math.min(Math.max(12, rect.right - width), window.innerWidth - width - 12);
  const top = Math.min(rect.bottom + 10, window.innerHeight - 54);
  selectionMenu.style.left = `${left}px`;
  selectionMenu.style.top = `${top}px`;
  selectionMenu.hidden = false;
}

function header() {
  return `<header class="app-header">
    <button class="plain-button brand" data-action="home" aria-label="Vulpin home"><img src="assets/vulpin-logo.png" alt=""><span>Vulpin</span></button>
    <div class="header-actions"><button class="icon-button" data-action="notice" aria-label="Help">${icon('question')}</button><button class="icon-button" data-action="notice" aria-label="Settings">${icon('gear')}</button><span class="avatar" aria-label="Profile for Alex">A</span></div>
  </header>`;
}

function contextualHeader(title, badge = '') {
  return `<header class="contextual-header"><button class="icon-button" data-action="back" aria-label="Go back">${icon('caret-left')}</button><div class="contextual-title">${title}</div>${badge ? `<span class="badge">${badge}</span>` : '<span></span>'}</header>`;
}

function workspaceBar(title, badge = '') {
  return `<div class="workspace-bar"><button class="icon-button" data-action="back" aria-label="Go back">${icon('caret-left')}</button><div class="workspace-title">${title}</div>${badge ? `<span class="badge">${badge}</span>` : '<span></span>'}</div>`;
}

function learningHeader() {
  return `<header class="learning-header"><div class="learning-header-left"><button class="icon-button" data-action="back" aria-label="Back to learning space">${icon('caret-left')}</button></div><div class="learning-header-title"><strong>Photosynthesis</strong><span>Topic 2 of 5</span></div><div class="learning-header-actions"><span class="lesson-progress"><span style="width:40%"></span></span><span class="badge">2 of 5</span></div></header>`;
}

function lessonModule() {
  return `<article class="lesson-module">
    <div class="lesson-title-row"><div><p class="lesson-label">Photosynthesis · energy conversion</p><h1>How plants convert light into stored chemical energy</h1><p class="lesson-lede">Photosynthesis is not a single reaction. It is a coordinated system that captures light, moves electrons, and stores the resulting energy in sugars that a plant can use later.</p></div><span class="read-time">12 min read</span></div>
    <section id="big-picture" class="lesson-section"><h2>The big picture</h2><p>In chloroplasts, light energy is transformed into chemical energy. The process has two linked stages: <strong>light-dependent reactions</strong> make ATP and NADPH, then the <strong>Calvin cycle</strong> uses those molecules to build carbohydrates from carbon dioxide.</p><p>The overall equation is deceptively simple: six molecules of carbon dioxide and six molecules of water, powered by light, yield one molecule of glucose and six molecules of oxygen. But the steps that connect those inputs to those outputs involve dozens of intermediate reactions, many proteins, and two distinct compartments inside the chloroplast.</p><p>Understanding photosynthesis means following the flow of energy and matter simultaneously. Energy flows from photons to excited electrons to chemical bonds. Matter flows from water and carbon dioxide into organic molecules. The two flows are coupled at several points, and that coupling is what makes the whole system work.</p><div class="concept-strip"><div><span>Inputs</span><strong>Light · water · carbon dioxide</strong></div><span class="concept-arrow">${icon('next')}</span><div><span>Outputs</span><strong>Oxygen · sugars · stored energy</strong></div></div><div class="lesson-relations"><div class="relation-chip"><strong>Related lesson:</strong><button data-action="related-chip">Also covered in "Plant Biology"</button></div></div></section>
    <section id="capture-light" class="lesson-section"><h2>1. Capture light in the thylakoid membrane</h2><p>Chlorophyll pigments absorb specific wavelengths of light. That absorbed energy excites electrons in photosystems embedded in the thylakoid membrane. Water is split to replace the electrons, which is why oxygen is released as a by-product.</p><p>Each photosystem contains hundreds of chlorophyll molecules arranged in an antenna complex. When one molecule absorbs a photon, the energy is passed from molecule to molecule until it reaches the reaction center, where it drives a charge separation. This is the moment light energy becomes electrochemical energy.</p><p>The two photosystems, called Photosystem II and Photosystem I, work in series. Photosystem II absorbs light first, splits water, and sends electrons down an transport chain. Photosystem I re-energizes those electrons with a second photon, boosting them to an even higher energy level.</p><div class="lesson-example"><span class="example-mark">Example</span><p>When a houseplant is near a bright window, chlorophyll can capture more photons than it can in a dim corner. Light intensity changes how quickly this stage can run—up to the point where another factor becomes limiting. At very high light intensities, the photosystems become saturated and excess energy must be dissipated as heat to prevent damage.</p></div><div class="lesson-relations"><div class="relation-chip"><strong>Prerequisite:</strong><button data-action="related-chip">You might need to learn the basics of this in "ATP &amp; Energy"</button></div></div></section>
    <section id="energy-carriers" class="lesson-section"><h2>2. Package energy as ATP and NADPH</h2><p>Excited electrons travel through an electron transport chain. Their movement helps build a proton gradient, and ATP synthase uses that gradient to make ATP. At the end of the chain, NADP<sup>+</sup> gains electrons to become NADPH.</p><p>The electron transport chain is embedded in the thylakoid membrane. As electrons move from one protein complex to the next, they release energy. Some of that energy is used to pump hydrogen ions from the stroma into the thylakoid lumen, creating a concentration difference across the membrane.</p><p>ATP synthase is a molecular turbine. Protons flow back through it down their concentration gradient, and that flow drives the rotation of a molecular shaft that joins phosphate groups to ADP, producing ATP. This mechanism, called chemiosmosis, was one of the great insights of twentieth-century biology.</p><ul class="key-list"><li><strong>ATP</strong> supplies immediately usable energy.</li><li><strong>NADPH</strong> carries high-energy electrons.</li><li>Both molecules are temporary energy carriers, not the final food product.</li></ul><div class="lesson-relations"><div class="relation-chip"><strong>Related concept:</strong><button data-action="related-chip">This connects to "Cellular Respiration"</button></div></div></section>
    <section id="calvin-cycle" class="lesson-section"><h2>3. Build sugars in the Calvin cycle</h2><p>In the chloroplast stroma, the Calvin cycle uses ATP and NADPH to fix carbon dioxide into a three-carbon molecule. The cycle must run several times before the plant has enough building material to assemble glucose and other carbohydrates.</p><p>The cycle begins when the enzyme RuBisCO attaches CO<sub>2</sub> to a five-carbon sugar called ribulose bisphosphate. The resulting six-carbon intermediate immediately splits into two three-carbon molecules. These are then reduced using ATP and NADPH, forming glyceraldehyde-3-phosphate, a versatile three-carbon sugar.</p><p>Most of the glyceraldehyde-3-phosphate is used to regenerate ribulose bisphosphate so the cycle can continue. Only a small fraction is net gain—exported from the chloroplast to build glucose, starch, sucrose, and the carbon skeletons of amino acids and fatty acids.</p><div class="lesson-example"><span class="example-mark">Example</span><p>The Calvin cycle is often called the "dark reactions" because it does not directly require light. However, it depends entirely on the ATP and NADPH produced by the light reactions. In the dark, those carriers run out within seconds and the cycle stops. This is why most photosynthesis happens during the day, even though the Calvin cycle itself is light-independent.</p></div></section>
    <section class="lesson-section key-takeaway"><h2>Key takeaway</h2><p>Light-dependent reactions capture energy and make ATP plus NADPH. The Calvin cycle spends those carriers to turn carbon dioxide into sugars. Keeping the two stages connected explains both <em>where</em> photosynthesis occurs and <em>why</em> each molecule matters.</p><p>The entire process is a chain of energy transformations: radiant energy to electron excitation to proton gradient to chemical bond energy to carbohydrate. At each step, some energy is lost as heat, which is why photosynthesis is not perfectly efficient—but it is efficient enough to power virtually all life on Earth.</p></section>
  </article>`;
}

function loginView(anim) {
  return `<main id="main" class="login-screen ${anim?'screen-enter':''}">
    <section class="login-visual" aria-label="Vulpin introduction">
      <div class="brand"><img src="assets/vulpin-logo.png" alt=""><span>Vulpin</span></div>
      <div class="login-copy"><p class="eyebrow">Intelligent study companion</p><h1>Learn with evidence, not guesswork.</h1><p>Build a study plan around your deadline, depth, and trusted sources. Every important claim stays traceable.</p></div>
      <img class="login-fox" src="assets/vulpin-logo.png" alt="Vulpin fox reading a book">
    </section>
    <section class="login-panel">
      <p class="eyebrow">Welcome back</p><h2>Sign in to study</h2><p class="muted">Your topics and progress are waiting.</p>
      <form class="login-form" data-form="login" novalidate>
        <label class="field">Email address<input name="email" type="email" autocomplete="email" placeholder="alex@example.com"></label>
        <label class="field">Password<input name="password" type="password" autocomplete="current-password" placeholder="At least 6 characters"></label>
        <p class="field-error" data-login-error></p>
        <button class="button primary" type="submit">Sign in</button>
        <div class="divider">or</div>
        <button class="button google" type="button" data-action="google">Continue with Google</button>
      </form>
    </section>
  </main>`;
}

function libraryView(anim) {
  return `${header()}<main id="main" class="page ${anim?'screen-enter':''}"><section class="page-title"><p class="eyebrow">Your learning space</p><h1>My Topics</h1><p class="muted">Pick up where you left off or shape a new plan.</p></section>
  <section class="library-grid" aria-label="Study topics">${topics.map((t,i)=>`<button class="topic-card" data-action="topic" data-topic="${i}"><span class="topic-top"><span class="folder" aria-hidden="true">${icon('folder')}</span><span class="topic-more" aria-hidden="true">${icon('more')}</span></span><h2>${t[0]}</h2><p class="muted">${i === 0 ? 'Turn light, water, and carbon dioxide into a connected mental model.' : i === 1 ? 'Causes, turning points, and consequences.' : 'Vectors, matrices, spaces, and transformations.'}</p><span class="topic-meta"><span>${t[1]}</span><span class="mini-progress"><span style="width:${t[2]}%"></span></span></span></button>`).join('')}</section>
  <div class="new-topic-wrap"><button class="button secondary new-topic" data-action="new-topic">${icon('plus')}<span>New Topic</span></button></div></main>`;
}

function calendarDays() {
  const days = ['M','T','W','T','F','S','S'].map(d=>`<span>${d}</span>`).join('');
  const blanks = '<span></span>'.repeat(1);
  return days + blanks + Array.from({length:30},(_,i)=>`<button data-action="date" data-date="Sep ${i+1}" class="${state.deadline === `Sep ${i+1}` ? 'selected' : ''}">${i+1}</button>`).join('');
}

function setupView() {
  const done1 = state.setupStep >= 2;
  const goals = ['Pass an exam','Understand the basics','Build a project','Refresh my memory'];
  return `${contextualHeader('Study Plan')}<main id="main" class="setup-page"><div class="setup-heading"><p class="eyebrow">Create a focused plan</p><h1>Study Photosynthesis</h1><p class="muted">Three choices, then Vulpin builds the path.</p></div>
    <section class="accordion">
      <article class="step-card ${done1?'done':''}"><button class="step-head" data-action="open-step" data-step="1"><span class="step-number">${done1?icon('check'):'1'}</span><strong>Set a deadline</strong><span class="step-summary">${state.deadline || (state.setupStep===1?'Choose a date':'')}</span></button>${state.setupStep===1?`<div class="step-content"><div class="deadline-layout"><div class="preset-list"><button class="preset" data-action="preset" data-date="Today">Today</button><button class="preset" data-action="preset" data-date="Tomorrow">Tomorrow</button><button class="preset" data-action="preset" data-date="In one week">In one week</button></div><div class="calendar"><div class="calendar-title"><span>September 2026</span><span class="calendar-nav">${icon('chevronLeft')}${icon('chevronRight')}</span></div><div class="calendar-grid">${calendarDays()}</div></div></div></div>`:''}</article>
      <article class="step-card ${state.setupStep>=2?'open':''}"><button class="step-head" data-action="open-step" data-step="2"><span class="step-number">${state.setupStep>=2?'2':'2'}</span><strong>Choose learning depth</strong><span class="step-summary">${['Overview','Essentials','Balanced','Detailed','Deep dive'][state.depth-1]}</span></button>${state.setupStep>=2?`<div class="step-content"><div class="depth-scale" draggable="true"><input aria-label="Learning depth" type="range" min="1" max="5" value="${state.depth}" data-action="depth"><div class="depth-labels">${['Overview','Essentials','Balanced','Detailed','Deep dive'].map((x,i)=>`<button class="${state.depth===i+1?'active':''}" data-action="depth-label" data-depth="${i+1}">${x}</button>`).join('')}</div></div></div>`:''}</article>
      <article class="step-card goal-card ${state.setupStep>=2?'open':''}"><button class="step-head" data-action="open-step" data-step="3"><span class="step-number">3</span><strong>Tell us your goal</strong><span class="step-badge">Optional</span><span class="step-summary">${state.goals.join(', ')}</span></button>${state.setupStep>=2?`<div class="step-content"><div class="goal-chips">${goals.map(g=>`<button class="goal-chip ${state.goals.includes(g)?'selected':''}" data-action="goal" data-goal="${g}">${g}</button>`).join('')}</div><label class="field goal-textarea">Add context (optional)<textarea rows="2" data-action="custom-goal" placeholder="e.g. I struggle with the Calvin cycle">${state.customGoal}</textarea></label></div>`:''}</article>
    </section>
    <div class="goal-section"><button class="button primary button-md" data-action="continue-sources" ${!state.deadline ? 'disabled' : ''}>Continue${icon('arrow-right')}</button></div></main>`;
}

function sourcesView(anim) {
  const suggestions = [
    ['Light-dependent reactions explained','Nature Education','ARTICLE'],
    ['The Calvin cycle in five steps','MIT OpenCourseWare','VIDEO'],
    ['Plant energy conversion — review','Frontiers for Young Minds','PDF']
  ];
  const typeIcons = { PDF: 'file-pdf', LINK: 'link', VIDEO: 'video' };
  return `${contextualHeader('Add Sources', state.sources.length + ' sources')}<main id="main" class="page ${anim?'screen-enter':''}">
    <div class="sources-content"><div class="source-top"><button class="add-source" data-action="add-source">${icon('plus')}<strong>Add a source</strong><span class="muted">PDF, link, or video</span></button>${state.sources.slice(0,3).map(s=>`<article class="source-card"><div class="source-card-top"><span class="source-type">${icon(typeIcons[s.type] || 'file')} ${s.type}</span><button class="source-remove" data-action="remove-source" data-id="${s.id}" aria-label="Remove ${s.title}">${icon('x')}</button></div><div class="source-card-icon">${icon(typeIcons[s.type] || 'file')}</div><h3>${s.title}</h3><p>${s.note}</p></article>`).join('')}</div>
    <section class="suggested-card"><h2>Suggested sources</h2>${suggestions.map((s,i)=>`<div class="suggestion-row"><strong>${s[0]}</strong><span>${s[1]}</span><button class="add-suggestion" data-action="add-suggestion" data-index="${i}">${icon('plus')}<span>Add</span></button></div>`).join('')}</section></div>
    <div class="generate-wrap"><button class="button primary button-md button-wide" data-action="${state.editingSources ? 'update-sources' : 'generate'}" ${state.sources.length<2?'disabled':''}>${state.editingSources ? 'Update Sources' : 'Generate Study Plan'}</button></div>
  </main>`;
}

const relatedLessons = {
  'plant-biology': { title: 'Plant Biology', source: 'Campbell Biology · Chapter 10', eyebrow: 'Campbell Biology', page: '182', sections: [{ h: 'Plant Cell Structure', p: 'Plant cells contain chloroplasts, organelles responsible for photosynthesis. Each chloroplast is enclosed by a double membrane and contains an intricate internal membrane system called the thylakoid membrane. The fluid-filled space surrounding the thylakoids is the stroma.' }, { h: 'Types of Plant Tissues', p: 'Plants have three main tissue types: dermal, vascular, and ground. Dermal tissue forms the outer covering. Vascular tissue (xylem and phloem) transports water and nutrients. Ground tissue performs photosynthesis, storage, and support.' }, { h: 'How Leaves Are Adapted', p: 'Leaves are the primary photosynthetic organs. Their broad, flat shape maximizes light absorption. Stomata on the leaf surface allow gas exchange — CO₂ enters and O₂ exits. The waxy cuticle prevents excessive water loss.' }] },
  'atp-energy': { title: 'ATP & Energy', source: 'Molecular Biology of the Cell · Chapter 2', eyebrow: 'Molecular Biology of the Cell', page: '68', sections: [{ h: 'What Is ATP?', p: 'Adenosine triphosphate (ATP) is the cell\'s primary energy currency. It consists of adenine, ribose, and three phosphate groups. The bonds between the phosphate groups store potential energy that can be released when needed.' }, { h: 'How ATP Is Made', p: 'ATP is produced through cellular respiration and photosynthesis. In photosynthesis, light energy drives the synthesis of ATP during the light-dependent reactions. This ATP then powers the Calvin cycle to build sugars.' }, { h: 'Energy Coupling', p: 'Cells use ATP to power endergonic reactions through energy coupling. When ATP is hydrolyzed to ADP and phosphate, the released energy drives otherwise unfavorable reactions forward. This is fundamental to all cellular work.' }] },
  'cellular-respiration': { title: 'Cellular Respiration', source: 'Biology 2e · Chapter 7', eyebrow: 'OpenStax Biology 2e', page: '143', sections: [{ h: 'Overview of Respiration', p: 'Cellular respiration is the metabolic pathway that breaks down glucose and produces ATP. The stages include glycolysis, pyruvate oxidation, the citric acid cycle, and oxidative phosphorylation. It is essentially the reverse of photosynthesis.' }, { h: 'Glycolysis', p: 'Glycolysis occurs in the cytoplasm and breaks one glucose molecule into two pyruvate molecules. It produces a net gain of 2 ATP and 2 NADH. This ancient pathway does not require oxygen.' }, { h: 'The Electron Transport Chain', p: 'The electron transport chain uses high-energy electrons from NADH and FADH₂ to pump hydrogen ions across a membrane, creating a gradient. ATP synthase uses this gradient to produce large amounts of ATP — up to 34 molecules per glucose.' }] }
};

function relatedPanelContent(key) {
  const lesson = relatedLessons[key];
  if (!lesson) return '';
  return `<aside class="source-panel"><div class="source-panel-head"><strong>${lesson.title}</strong><span class="verified">${icon('link')}<span>Related</span></span><button class="panel-icon" data-action="expand" aria-label="Expand panel">${icon(state.relatedPanelExpanded ? 'collapse' : 'expand')}</button><button class="panel-icon" data-action="close-related" aria-label="Close panel">${icon('x')}</button></div><div class="source-context"><span>Related topic</span><strong>${lesson.source}</strong></div><div class="paper-preview"><p class="eyebrow">${lesson.eyebrow}</p>${lesson.sections.map(s => `<h2>${s.h}</h2><p>${s.p}</p>`).join('')}</div><div class="source-panel-actions"><button class="text-button">${icon('arrow-square-out')} Open Full Source</button><span class="muted">Page ${lesson.page}</span></div></aside>`;
}

function evidencePanelContent() {
  return `<aside class="source-panel"><div class="source-panel-head"><strong>Biology 2e · 8.2</strong><span class="verified">${icon('check')}<span>Verified</span></span><button class="panel-icon" data-action="expand" aria-label="${state.relatedPanelExpanded?'Restore':'Expand'} source">${icon(state.relatedPanelExpanded?'collapse':'expand')}</button><button class="panel-icon" data-action="close-related" aria-label="Close panel">${icon('x')}</button></div><div class="source-context"><span>Claim trace</span><strong>${state.selectedClaim || 'Thylakoid membranes host the light-dependent reactions.'}</strong></div><div class="paper-preview"><p class="eyebrow">OpenStax Biology 2e</p><h2>8.2 The Light-Dependent Reactions of Photosynthesis</h2><p>Visible light is one type of energy emitted by the sun. Each type of electromagnetic radiation has a characteristic range of wavelengths.</p><p class="marked">In plants, the light-dependent reactions take place in the thylakoid membranes of organelles called chloroplasts.</p><p>These reactions convert solar energy into chemical energy in the form of ATP and NADPH.</p></div><div class="source-panel-actions"><button class="text-button">${icon('arrow-square-out')} Open Full Source</button><span class="muted">Page 214</span></div></aside>`;
}

function studyView(anim) {
  const hasPanel = state.relatedPanel !== null;
  const panelContent = !hasPanel ? '' : (state.panelType === 'evidence' ? evidencePanelContent() : relatedPanelContent(state.relatedPanel));
  return `<main id="main" class="learning-page ${anim?'screen-enter':''}">${learningHeader()}<div class="${hasPanel ? 'lesson-evidence-layout' + (state.relatedPanelExpanded ? ' expanded' : '') : 'learning-layout'}"><section class="${hasPanel ? 'evidence-reading' : 'lesson-reading'}">${lessonModule()}</section>${panelContent}</div><div class="lesson-footer"><button class="button secondary button-md" data-action="next-topic">${icon('file-text')}<span>Next Topic</span></button><button class="button primary button-md" data-action="quiz">${icon('pencil-simple')}<span>Take Quiz</span></button></div></main>`;
}

function evidenceView(anim) {
  return `<main id="main" class="learning-page ${anim?'screen-enter':''}">${learningHeader()}<div class="lesson-evidence-layout ${state.panelExpanded?'expanded':''}"><section class="evidence-reading">${lessonModule()}<div class="lesson-actions"><button class="button primary" data-action="quiz">Take Quiz</button><button class="button secondary" data-action="study"><span>Return to reading</span>${icon('next')}</button></div></section><aside class="source-panel"><div class="source-panel-head"><strong>Biology 2e · 8.2</strong><span class="verified">${icon('check')}<span>Verified</span></span><button class="panel-icon" data-action="expand" aria-label="${state.panelExpanded?'Restore':'Expand'} source">${icon(state.panelExpanded?'collapse':'expand')}</button><button class="panel-icon" data-action="study" aria-label="Close source">${icon('close')}</button></div><div class="source-context"><span>Claim trace</span><strong>${state.selectedClaim || 'Thylakoid membranes host the light-dependent reactions.'}</strong></div><div class="paper-preview"><p class="eyebrow">OpenStax Biology 2e</p><h2>8.2 The Light-Dependent Reactions of Photosynthesis</h2><p>Visible light is one type of energy emitted by the sun. Each type of electromagnetic radiation has a characteristic range of wavelengths.</p><p class="marked">In plants, the light-dependent reactions take place in the thylakoid membranes of organelles called chloroplasts.</p><p>These reactions convert solar energy into chemical energy in the form of ATP and NADPH.</p></div>${state.fullSource?`<div class="full-source"><strong>Expanded passage</strong><br>Photosystems absorb light and transfer its energy through an electron transport chain. Water supplies replacement electrons, releasing oxygen as a by-product.</div>`:''}<div class="source-panel-actions"><button class="text-button" data-action="full-source">${state.fullSource?'Hide full source':'Open Full Source'} ${icon('arrow-square-out')}</button><span class="muted">Page 214</span></div></aside></div></main>`;
}

function quizView(anim) {
  const item = quiz[state.quizIndex], selected = state.answers[state.quizIndex];
  const isLast = state.quizIndex === quiz.length - 1;
  const isCorrect = selected === item.answer;
  const showHintCard = state.quizShowHints;
  const hintRevealed = state.hintRevealed;
  const canAdvance = selected !== undefined;
  const qLabel = state.quizRound === 2 ? `Question ${state.quizWrong.indexOf(state.quizIndex) + 1} of ${state.quizWrong.length}` : `Question ${state.quizIndex + 1} of ${quiz.length}`;
  return `<main id="main" class="learning-page ${anim ? 'screen-enter' : ''}">${learningHeader()}<div class="learning-layout"><section class="lesson-reading"><div class="quiz-layout"><article class="quiz-module"><p class="lesson-label">${qLabel}</p>${showHintCard ? `<button class="hint-spoiler ${hintRevealed ? 'revealed' : ''}" data-action="hint-reveal">${hintRevealed ? `<div class="hint-content"><span class="hint-label">Hint</span><span class="hint-text">${item.hint}</span></div>` : `<span class="hint-icon">${icon('lightbulb')}</span><span class="hint-label">Click to reveal hint</span>`}</button>` : ''}<h1>${item.q}</h1><div class="options" role="radiogroup">${item.options.map((o, i) => `<label class="option ${selected === i ? 'selected' : ''}"><input type="radio" name="answer" value="${i}" data-action="answer" ${selected === i ? 'checked' : ''}><span>${o}</span></label>`).join('')}</div></article></div></section></div><div class="lesson-footer"><img class="quiz-fox" src="assets/fox-thinking.png" alt="A curious fox thinking"><button class="button primary button-md" data-action="quiz-next" ${canAdvance ? '' : 'disabled'}>${isLast ? icon('check') : icon('arrow-right')}<span>${isLast ? 'Finish Quiz' : 'Next question'}</span></button></div></main>`;
}

function feedbackView(correct, anim) {
  const score = quiz.filter((q, i) => state.answers[i] === q.answer).length;
  return `<main id="main" class="feedback-screen ${anim?'screen-enter':''}"><section class="feedback-card"><img src="assets/${correct?'feedback-correct.jpg':'feedback-wrong.jpg'}" alt="${correct?'Happy fox with a check mark':'Thoughtful fox with a cross'}">${correct ? '<p class="eyebrow">Quiz complete</p>' : ''}<h1>${correct ? 'You got it!' : 'Not quite right'}</h1><p>${correct ? 'You connected the reaction location, energy carriers, and carbon cycle correctly.' : `You got <strong>${score} out of ${quiz.length}</strong> correct. Review and try again.`}</p><button class="button ${correct?'primary':'secondary'}" data-action="${correct?'progress':'retry'}">${icon(correct ? 'chart-line-up' : 'arrow-clockwise')}<span>${correct ? 'View progress' : 'Review and retry'}</span></button></section></main>`;
}

function progressView(anim) {
  return `<main id="main" class="progress-page ${anim?'screen-enter':''}"><header class="learning-header"><div class="learning-header-left"><button class="icon-button" data-action="back" aria-label="Go back">${icon('caret-left')}</button></div><div class="learning-header-title"><strong>Progress</strong><span>Plan 40%</span></div><div class="learning-header-actions"><span class="badge">Plan 40%</span></div></header><section class="progress-body"><div class="progress-content"><p class="eyebrow">Photosynthesis plan</p><h1>You're connecting ideas across the entire system.</h1><div class="progress-number">40%</div><div class="progress-track" aria-label="40 percent complete"><span></span></div><div class="topic-segments"><article class="segment complete"><strong>Light reactions</strong><span>Complete · quiz passed</span></article><article class="segment"><strong>Calvin cycle</strong><span>Up next · 12 min</span></article><article class="segment"><strong>Factors & rates</strong><span>Locked · 10 min</span></article></div><div class="progress-actions"><button class="button primary button-md" data-action="next-topic">${icon('arrow-right')}<span>Next Topic</span></button><button class="button secondary button-md" data-action="home">${icon('house')}<span>Go to workspace</span></button></div></div><img class="progress-fox" src="assets/fox-progress.png" alt="A fox giving a thumbs up"></section></main>`;
}

function render() {
  hideSelectionMenu();
  const anim = state.animateIn;
  state.animateIn = false;
  const views = { login: loginView, library: libraryView, setup: setupView, sources: sourcesView, study: studyView, evidence: evidenceView, quiz: quizView, feedbackCorrect: (a)=>feedbackView(true, a), feedbackWrong: (a)=>feedbackView(false, a), progress: progressView };
  app.innerHTML = views[state.screen](anim);
  window.scrollTo(0,0);
}

function go(screen) { state.screen = screen; state.animateIn = true; render(); }
function showToast(message) { toast.textContent = message; toast.classList.add('show'); clearTimeout(showToast.timer); showToast.timer = setTimeout(()=>toast.classList.remove('show'),1800); }
function completeDeadline(value) { state.deadline = value; state.setupStep = 2; render(); }

app.addEventListener('submit', event => {
  if (!event.target.matches('[data-form="login"]')) return;
  event.preventDefault();
  const data = new FormData(event.target), email = String(data.get('email')).trim(), password = String(data.get('password'));
  const error = event.target.querySelector('[data-login-error]');
  if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 6) { error.textContent = 'Enter a valid email and a password of at least 6 characters.'; return; }
  go('library');
});

app.addEventListener('input', event => {
  if (event.target.matches('[data-action="depth"]')) { state.depth = Number(event.target.value); state.depthSelected = true; app.querySelectorAll('.depth-labels button').forEach((b,i)=>b.classList.toggle('active',i===state.depth-1)); }
  if (event.target.matches('[data-action="custom-goal"]')) state.customGoal = event.target.value;
});

app.addEventListener('change', event => {
  if (event.target.matches('[data-action="depth"]')) { state.depth = Number(event.target.value); state.depthSelected = true; render(); }
  if (event.target.matches('[data-action="answer"]')) { state.answers[state.quizIndex] = Number(event.target.value); render(); }
});

document.addEventListener('selectionchange', () => requestAnimationFrame(showSelectionMenu));
document.addEventListener('pointerdown', event => {
  if (!selectionMenu.contains(event.target) && !event.target.closest('.lesson-reading') && !event.target.closest('.evidence-reading')) hideSelectionMenu();
});
selectionMenu.addEventListener('pointerdown', event => event.preventDefault());
selectionMenu.addEventListener('click', event => {
  if (!event.target.closest('[data-action="view-original"]')) return;
  hideSelectionMenu();
  state.panelType = 'evidence';
  if (!state.relatedPanel) state.relatedPanel = 'plant-biology';
  render();
});

app.addEventListener('click', event => {
  const target = event.target.closest('[data-action]'); if (!target) return;
  const action = target.dataset.action;
  if (action === 'google') return go('library');
  if (action === 'home') return go('library');
  if (action === 'notice') return showToast('This control is available in the full product.');
  if (action === 'related-chip') { const map = { 'Also covered in "Plant Biology"': 'plant-biology', 'You might need to learn the basics of this in "ATP &amp; Energy"': 'atp-energy', 'This connects to "Cellular Respiration"': 'cellular-respiration' }; state.relatedPanel = map[target.textContent] || 'plant-biology'; state.panelType = 'related'; return render(); }
  if (action === 'close-related') { state.relatedPanel = null; state.relatedPanelExpanded = false; state.panelType = 'related'; return render(); }
  if (action === 'topic' || action === 'new-topic') { state.setupStep = 1; return go('setup'); }
  if (action === 'open-step') { const step = Number(target.dataset.step); if (step===1 || ((step===2 || step===3) && state.deadline)) { state.setupStep = step===3 ? 2 : step; render(); } return; }
  if (action === 'preset' || action === 'date') return completeDeadline(target.dataset.date);
  if (action === 'depth-label') { state.depth = Number(target.dataset.depth); state.depthSelected = true; return render(); }
  if (action === 'goal') { const goal = target.dataset.goal; state.goals = state.goals.includes(goal) ? state.goals.filter(g=>g!==goal) : [...state.goals,goal]; return render(); }
  if (action === 'continue-sources') return go('sources');
  if (action === 'add-source') { const id = Date.now(); state.sources.push({id,type:'LINK',title:'Added study source',note:'Personal source · ready to review'}); render(); return showToast('Source added.'); }
  if (action === 'remove-source') { state.sources = state.sources.filter(s=>s.id!==Number(target.dataset.id)); render(); return; }
  if (action === 'add-suggestion') { const source = [['ARTICLE','Light-dependent reactions explained','Nature Education'],['VIDEO','The Calvin cycle in five steps','MIT OpenCourseWare'],['PDF','Plant energy conversion — review','Frontiers for Young Minds']][Number(target.dataset.index)]; state.sources.push({id:Date.now(),type:source[0],title:source[1],note:source[2]}); render(); return showToast('Suggestion added to your plan.'); }
  if (action === 'generate') return go('study');
  if (action === 'update-sources') { state.editingSources = false; return go('study'); }
  if (action === 'evidence') return go('evidence');
  if (action === 'study') return go('study');
  if (action === 'expand') { if (state.relatedPanel) { state.relatedPanelExpanded = !state.relatedPanelExpanded; } else { state.panelExpanded = !state.panelExpanded; } return render(); }
  if (action === 'full-source') { state.fullSource = !state.fullSource; return render(); }
  if (action === 'quiz') { state.quizIndex = 0; state.answers = []; state.quizHint = false; state.quizWrong = []; state.quizRound = 1; state.quizShowHints = false; state.hintRevealed = false; return go('quiz'); }
  if (action === 'answer') { state.answers[state.quizIndex] = Number(target.value); state.quizHint = false; state.hintRevealed = false; if (Number(target.value) !== quiz[state.quizIndex].answer) { if (state.quizRound === 1) { state.quizWrong.push(state.quizIndex); } else { state.quizHint = true; } } else { if (state.quizRound === 2) state.quizWrong = state.quizWrong.filter(i => i !== state.quizIndex); } render(); return; }
  if (action === 'hint-reveal') { state.hintRevealed = !state.hintRevealed; return render(); }
  if (action === 'quiz-next') { if (state.answers[state.quizIndex] === undefined) return; state.hintRevealed = false; if (state.quizRound === 1 && state.quizIndex < quiz.length - 1) { state.quizIndex += 1; state.quizHint = false; return render(); } if (state.quizRound === 1) { const allCorrect = state.quizWrong.length === 0; return go(allCorrect ? 'feedbackCorrect' : 'feedbackWrong'); } const wrongList = state.quizWrong; const currentPos = wrongList.indexOf(state.quizIndex); const nextPos = currentPos + 1; if (nextPos < wrongList.length) { state.quizIndex = wrongList[nextPos]; state.answers[wrongList[nextPos]] = undefined; state.quizHint = false; return render(); } return go(state.answers[state.quizIndex] === quiz[state.quizIndex].answer ? 'feedbackCorrect' : 'feedbackWrong'); }
  if (action === 'retry') { const firstWrong = state.quizWrong[0]; state.answers[firstWrong] = undefined; state.quizIndex = firstWrong; state.quizHint = false; state.quizRound = 2; state.quizShowHints = true; state.hintRevealed = false; return go('quiz'); }
  if (action === 'progress') return go('progress');
  if (action === 'next-topic') return showToast('Calvin cycle is ready — your next task is queued.');
  if (action === 'back') { if (state.screen==='sources') { state.setupStep=2; return go('setup'); } if (['study','evidence'].includes(state.screen)) { document.querySelector('#confirm-modal').hidden = false; return; } if (state.screen==='quiz') return go('study'); if (state.screen==='progress') return go('library'); return go('library'); }
  if (action === 'modal-confirm') { document.querySelector('#confirm-modal').hidden = true; state.editingSources = false; return go('library'); }
  if (action === 'modal-cancel') { document.querySelector('#confirm-modal').hidden = true; return; }
  if (action === 'edit-sources') { state.editingSources = true; return go('sources'); }
});

render();
