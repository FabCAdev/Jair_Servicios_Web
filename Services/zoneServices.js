class zoneServices {
  constructor() {
    this.zones = [];
  }

  create(data) {
    const newZone = {
      id: this.zones.length + 1,
      ...data
    };
    this.zones.push(newZone);
    return newZone;
  }

  getAll() {
    return this.zones;
  }

  getbyId(id) {
    return this.zones.find(item => item.id == id);
  }

  update(id, changes) {
    const index = this.zones.findIndex(item => item.id == id);
    const zone = this.zones[index];
    this.zones[index] = { ...zone, ...changes };
    return this.zones[index];
  }

  delete(id) {
    const index = this.zones.findIndex(item => item.id == id);
    this.zones.splice(index, 1);
    return { id };
  }
}

module.exports = zoneServices;
