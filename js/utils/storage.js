// Local storage utilities

function saveCreation(name, data) {
  try {
    localStorage.setItem(`celestial-harmony-${name}`, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Failed to save creation:', e);
    return false;
  }
}

function loadCreation(name) {
  try {
    const data = localStorage.getItem(`celestial-harmony-${name}`);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Failed to load creation:', e);
    return null;
  }
}

function deleteCreation(name) {
  try {
    localStorage.removeItem(`celestial-harmony-${name}`);
    return true;
  } catch (e) {
    console.error('Failed to delete creation:', e);
    return false;
  }
}