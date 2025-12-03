class devicesServices{
  constructor() {
    this.devices = [];
  }

  create(data) {
    const newDevice = {
      id: this.devices.length + 1,
      ...data
    }; 
    this.devices.push(newDevice);
    return newDevice;
  }

  getAll() {
    return this.devices;
  }

  getbyId(id) {
    return this.devices.find(item => item.id == id);
  }

  update(id, changes) {
    const index = this.devices.findIndex(item => item.id == id);
    const device = this.devices[index];
    this.devices[index] = {
      ...device,
      ...changes
    };
    return this.devices[index];
  }

  delete(id) {
    const index = this.devices.findIndex(item => item.id == id);
    this.devices.splice(index, 1);
    return { id };
  }
}
module.exports = devicesServices;