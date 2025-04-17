class Modal {
  constructor(id, options = {}) {
    this.modal = document.getElementById(id);
    if (!this.modal) {
      this.createModal(id);
    }
    
    this.options = {
      closeOnEscape: true,
      closeOnOutsideClick: true,
      ...options
    };
    
    this.setupEventListeners();
  }
  
  createModal(id) {
    this.modal = document.createElement('div');
    this.modal.id = id;
    this.modal.className = 'modal';
    
    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '&times;';
    
    // Add content container
    this.content = document.createElement('div');
    this.content.className = 'modal-content';
    
    this.modal.appendChild(closeBtn);
    this.modal.appendChild(this.content);
    document.body.appendChild(this.modal);
  }
  
  setupEventListeners() {
    // Close button
    const closeBtn = this.modal.querySelector('.modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }
    
    // Close on outside click
    if (this.options.closeOnOutsideClick) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }
    
    // Close on escape key
    if (this.options.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) {
          this.close();
        }
      });
    }
  }
  
  setContent(htmlContent) {
    this.content.innerHTML = htmlContent;
  }
  
  open() {
    this.modal.style.display = 'block';
    document.body.classList.add('modal-open');
    
    // Trigger open event
    const event = new CustomEvent('modal-open', { detail: { id: this.modal.id } });
    document.dispatchEvent(event);
  }
  
  close() {
    this.modal.style.display = 'none';
    document.body.classList.remove('modal-open');
    
    // Trigger close event
    const event = new CustomEvent('modal-close', { detail: { id: this.modal.id } });
    document.dispatchEvent(event);
  }
  
  isOpen() {
    return this.modal.style.display === 'block';
  }
  
  toggle() {
    if (this.isOpen()) {
      this.close();
    } else {
      this.open();
    }
  }
}