class usersServices {

  constructor() {
    this.users = [];
  }

  create(data) {
    const newUser = {
      id: this.users.length + 1,
      ...data
    }
    this.users.push(newUser);
    return newUser;
  }

  getAll() {
    return this.users;
  }

  getbyId(id) {
    return this.users.find(item => item.id == id);
  }

  update(id, changes) {
    const index = this.users.findIndex(item => item.id == id);
    const user = this.users[index];
    this.users[index] = {
      ...user,
      ...changes
    };
    return this.users[index];
  }

  delete(id) {
    const index = this.users.findIndex(item => item.id == id);
    this.users.splice(index, 1);
    return { id }
  }
}

module.exports = usersServices;
