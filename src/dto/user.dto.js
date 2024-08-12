class UserDTO {
  constructor(user) {
    this.id = user._id;
    this.first_name = user.first_name;
    this.last_name = user.last_name;
    this.email = user.email;
    this.age = user.age;
    this.role = user.role;
    this.documents = user.documents;
    this.cart = user.cart;
    this.last_connection = user.last_connection;
    this.refreshTokens = user.refreshTokens; // Asegúrate de incluir refreshTokens

    // Excluimos el password y los tokens de actualización de esta representación
  }
}

export default UserDTO;
