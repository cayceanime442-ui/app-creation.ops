const textarea = document.getElementById('postText');
const publishBtn = document.getElementById('publishBtn');
const feed = document.getElementById('feed');
const authScreen = document.getElementById('authScreen');
const appShell = document.getElementById('appShell');
const authTabs = document.querySelectorAll('.auth-tab');
const authForms = document.querySelectorAll('.auth-form');
const authMessage = document.getElementById('authMessage');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const logoutBtn = document.getElementById('logoutBtn');
const editProfileBtn = document.getElementById('editProfileBtn');
const topAvatar = document.getElementById('topAvatar');
const profileMenu = document.getElementById('profileMenu');
const avatarMenuWrap = document.querySelector('.avatar-menu-wrap');
const navItems = document.querySelectorAll('.nav-item');
const passwordToggles = document.querySelectorAll('.auth-password-toggle');

const storageKey = 'flex-social-users';
const sessionKey = 'flex-social-current-user';

let currentUser = null;

const crimsonAvatar = 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80';
const defaultAvatar = '';

function saveUsers(users) {
  localStorage.setItem(storageKey, JSON.stringify(users));
}

function loadUsers() {
  return JSON.parse(localStorage.getItem(storageKey) || '[]');
}

function saveCurrentUser(user) {
  localStorage.setItem(sessionKey, JSON.stringify(user));
}

function loadCurrentUser() {
  const user = localStorage.getItem(sessionKey);
  return user ? JSON.parse(user) : null;
}

function getUsers() {
  return loadUsers();
}

function setAuthMode(mode) {
  authTabs.forEach((tab) => tab.classList.toggle('active', tab.dataset.mode === mode));
  authForms.forEach((form) => form.classList.toggle('active', form.id === `${mode}Form`));
}

function updateAvatarElement(element, avatarUrl) {
  if (!element) return;

  if (avatarUrl) {
    element.style.backgroundImage = `url("${avatarUrl}")`;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
    element.textContent = '';
    element.classList.remove('avatar-placeholder');
  } else {
    element.style.backgroundImage = '';
    element.textContent = '';
    element.classList.add('avatar-placeholder');
  }
}

function updateProfileUI() {
  const nameEl = document.getElementById('profileName');
  const handleEl = document.getElementById('profileHandle');
  const welcomeEl = document.getElementById('welcomeMessage');
  const composerAvatar = document.getElementById('composerAvatar');
  const profileAvatar = document.getElementById('profileAvatar');

  if (!currentUser) return;

  nameEl.textContent = currentUser.name;
  handleEl.textContent = `@${currentUser.username}`;
  welcomeEl.textContent = `Welcome back, ${currentUser.name.split(' ')[0]}`;
  updateAvatarElement(topAvatar, currentUser.avatar || defaultAvatar);
  updateAvatarElement(composerAvatar, currentUser.avatar || defaultAvatar);
  updateAvatarElement(profileAvatar, currentUser.avatar || defaultAvatar);

  const followersCount = document.getElementById('followersCount');
  const followingCount = document.getElementById('followingCount');
  const postsCount = document.getElementById('postsCount');

  followersCount.textContent = currentUser.followers || '0';
  followingCount.textContent = currentUser.following || '0';
  postsCount.textContent = currentUser.posts || '0';
}

function showApp() {
  authScreen.classList.add('hidden');
  appShell.classList.remove('hidden');
}

function showAuth() {
  authScreen.classList.remove('hidden');
  appShell.classList.add('hidden');
}

function toggleProfileMenu(forceOpen) {
  if (!profileMenu) return;

  const shouldOpen = typeof forceOpen === 'boolean' ? forceOpen : profileMenu.classList.contains('hidden');
  profileMenu.classList.toggle('hidden', !shouldOpen);
  topAvatar?.setAttribute('aria-expanded', String(shouldOpen));
}

function hideProfileMenu() {
  toggleProfileMenu(false);
}

function createUserProfile(data) {
  const normalizedName = (data.name || '').toLowerCase();
  const normalizedUsername = (data.username || '').toLowerCase();
  const shouldUseCrimsonAvatar =
    normalizedName.includes('crimson') || normalizedUsername.includes('crimson');

  return {
    id: crypto.randomUUID(),
    name: data.name,
    username: data.username,
    email: data.email,
    password: data.password,
    avatar: data.avatar || (shouldUseCrimsonAvatar ? crimsonAvatar : defaultAvatar),
    followers: '0',
    following: '0',
    posts: '0'
  };
}

function loginUser(email, password) {
  const users = getUsers();
  const user = users.find((entry) => entry.email === email && entry.password === password);

  if (!user) {
    return false;
  }

  currentUser = user;
  saveCurrentUser(user);
  return true;
}

function registerUser(data) {
  const users = getUsers();
  const exists = users.some((entry) => entry.email === data.email || entry.username === data.username);

  if (exists) {
    return false;
  }

  const user = createUserProfile(data);
  users.push(user);
  saveUsers(users);
  currentUser = user;
  saveCurrentUser(user);
  return true;
}

authTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    setAuthMode(tab.dataset.mode);
  });
});

navItems.forEach((item) => {
  item.addEventListener('click', (event) => {
    event.preventDefault();
    navItems.forEach((navItem) => {
      navItem.classList.remove('active');
      navItem.setAttribute('aria-current', 'false');
    });
    item.classList.add('active');
    item.setAttribute('aria-current', 'page');
  });
});

topAvatar?.addEventListener('click', (event) => {
  event.stopPropagation();
  toggleProfileMenu();
});

document.addEventListener('click', (event) => {
  if (avatarMenuWrap && !avatarMenuWrap.contains(event.target)) {
    hideProfileMenu();
  }
});

passwordToggles.forEach((toggle) => {
  toggle.addEventListener('click', () => {
    const input = document.getElementById(toggle.dataset.target);
    if (!input) return;

    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    toggle.textContent = isPassword ? 'Hide' : 'Show';
  });
});

loginForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (loginUser(email, password)) {
    authMessage.textContent = '';
    updateProfileUI();
    showApp();
  } else {
    authMessage.textContent = 'Invalid email or password.';
  }
});

signupForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const data = {
    name: document.getElementById('signupName').value.trim(),
    username: document.getElementById('signupUsername').value.trim(),
    email: document.getElementById('signupEmail').value.trim(),
    password: document.getElementById('signupPassword').value
  };

  if (!data.name || !data.username || !data.email || !data.password) {
    authMessage.textContent = 'Please fill out all fields.';
    return;
  }

  if (registerUser(data)) {
    authMessage.textContent = '';
    updateProfileUI();
    showApp();
  } else {
    authMessage.textContent = 'An account with that email or username already exists.';
  }
});

logoutBtn.addEventListener('click', () => {
  currentUser = null;
  localStorage.removeItem(sessionKey);
  hideProfileMenu();
  showAuth();
  loginForm.reset();
  signupForm.reset();
  authMessage.textContent = '';
});

editProfileBtn.addEventListener('click', () => {
  const newName = prompt('Enter your new display name:', currentUser?.name || '');
  const newUsername = prompt('Enter your new username:', currentUser?.username || '');
  const newAvatar = prompt('Enter a new avatar URL (leave blank to remove):', currentUser?.avatar || '');

  if (newName !== null && newName.trim()) currentUser.name = newName.trim();
  if (newUsername !== null && newUsername.trim()) currentUser.username = newUsername.trim();
  if (newAvatar !== null) currentUser.avatar = newAvatar.trim();

  if (currentUser) {
    const users = getUsers();
    const index = users.findIndex((user) => user.email === currentUser.email);
    if (index !== -1) {
      users[index] = { ...users[index], ...currentUser };
      saveUsers(users);
      saveCurrentUser(currentUser);
    }
  }

  hideProfileMenu();
  updateProfileUI();
});

publishBtn.addEventListener('click', () => {
  const text = textarea.value.trim();

  if (!text) {
    textarea.focus();
    return;
  }

  const article = document.createElement('article');
  article.className = 'post-card';
  article.innerHTML = `
    <div class="post-header">
      <div class="user-meta">
        ${currentUser?.avatar ? `<div class="user-avatar" style="background-image:url('${currentUser.avatar}')"></div>` : '<div class="user-avatar avatar-placeholder"></div>'}
        <div>
          <h3>${currentUser?.name || 'You'}</h3>
          <p>Just now · Online</p>
        </div>
      </div>
      <button>⋯</button>
    </div>
    <p class="post-text">${text}</p>
    <div class="post-actions">
      <button class="like-btn">♥ 0</button>
      <button>💬 0</button>
      <button>↗ 0</button>
    </div>
  `;

  feed.prepend(article);
  textarea.value = '';

  const postCountEl = document.getElementById('postsCount');
  if (postCountEl) {
    const nextPosts = Number(postCountEl.textContent.replace(/[^0-9]/g, '')) + 1;
    postCountEl.textContent = `${nextPosts}`;
  }

  article.querySelector('.like-btn').addEventListener('click', () => {
    const current = article.querySelector('.like-btn');
    const count = Number(current.textContent.match(/\d+/)?.[0] || 0);
    current.textContent = `♥ ${count + 1}`;
  });
});

for (const button of document.querySelectorAll('.like-btn')) {
  button.addEventListener('click', () => {
    const count = Number(button.textContent.match(/\d+/)?.[0] || 0);
    button.textContent = `♥ ${count + 1}`;
  });
}

function initializeApp() {
  const savedUser = loadCurrentUser();
  if (savedUser) {
    currentUser = savedUser;
    updateProfileUI();
    showApp();
  } else {
    showAuth();
  }
}

initializeApp();

