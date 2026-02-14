/**
 * Entidad de dominio: Usuario
 */
export class User {
  constructor({ id, nombre, perfil, tipoUsuario, curso, grado, foto, ultimaFechaIng }) {
    this.id = id;
    this.nombre = nombre;
    this.perfil = perfil;
    this.tipoUsuario = tipoUsuario;
    this.curso = curso;
    this.grado = grado;
    this.foto = foto;
    this.ultimaFechaIng = ultimaFechaIng;
  }

  getInitials() {
    return this.nombre ? this.nombre.substring(0, 2).toUpperCase() : 'US';
  }

  getFirstName() {
    if (!this.nombre) return 'Usuario';
    const parts = this.nombre.split(' ');
    return parts[2] || parts[0] || 'Usuario';
  }
}
