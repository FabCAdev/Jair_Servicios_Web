class readingServices{
  constructor() {
    this.readings = [];
  }

  create(data) {
    const newReading = {
      id: this.readings.length + 1,
      ...data
    };
    this.readings.push(newReading);
    return newReading;
  }

  getAll() {
    return this.readings;
  }

  getbyId(id) {
    return this.readings.find(item => item.id == id);
  }

  update(id, changes) {
    const index = this.readings.findIndex(item => item.id == id);
    const reading = this.readings[index];
    this.readings[index] = {
      ...reading,
      ...changes
    };
    return this.readings[index];
  }

  delete(id) {
    const index = this.readings.findIndex(item => item.id == id);
    this.readings.splice(index, 1);
    return { id };
  }
}
module.exports = readingServices;