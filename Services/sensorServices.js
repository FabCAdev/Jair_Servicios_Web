class sensorServices {
  constructor() {
    this.sensors = [];
  }

  create(data) {
    const newSensor = {
      id: this.sensors.length + 1,
      ...data
    };
    this.sensors.push(newSensor);
    return newSensor;
  }

  getAll() {
    return this.sensors;
  }

  getbyId(id) {
    return this.sensors.find(item => item.id == id);
  }

  update(id, changes) {
    const index = this.sensors.findIndex(item => item.id == id);
    const sensor = this.sensors[index];
    this.sensors[index] = {
      ...sensor,
      ...changes
    };
    return this.sensors[index];
  }

  delete(id) {
    const index = this.sensors.findIndex(item => item.id == id);
    this.sensors.splice(index, 1);
    return { id };
  }
}

module.exports = sensorServices;
