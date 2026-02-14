/**
 * Entidad de dominio: Circular
 */
export class Circular {
  constructor({ circular, subject, description, state, type, auth, dateSend }) {
    this.circular = circular;
    this.subject = subject;
    this.description = description;
    this.state = state;
    this.type = type;
    this.auth = auth;
    this.dateSend = dateSend;
  }

  isViewed() {
    return this.state === '1';
  }

  isPending() {
    return this.state !== '1';
  }

  requiresAuth() {
    return this.type === '1';
  }

  getAuthStatus() {
    const authLower = (this.auth || '').toLowerCase().trim();
    if (authLower === 'si') return 'authorized';
    if (authLower === 'no') return 'not_authorized';
    if (authLower === 'na') return 'not_required';
    return 'pending';
  }
}
