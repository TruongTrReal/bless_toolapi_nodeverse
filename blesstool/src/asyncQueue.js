class AsyncQueue {
  constructor() {
    this.queue = [];
    this.running = false;
  }

  queueLength() {
    return this.queue.length;
  }

  // Hàm xử lý công việc trong queue

  async run() {
    if (this.running || this.queue.length === 0) return;

    this.running = true;
    while (this.queue.length > 0) {
      const task = this.queue.shift(); // Lấy công việc đầu tiên từ hàng đợi
      let retries = 2; // Số lần thử lại tối đa
      console.log(`🔴 ${"Queue length\x1b[33m"}: ${this.queue.length}`);
      while (retries > 0) {
        try {
          await task(); // Thực thi công việc async
          break; // Nếu thành công, thoát khỏi vòng lặp
        } catch (error) {
          if (error.message == "Update sheet failed") {
            break;
          }
          retries -= 1; // Giảm số lần thử lại
          console.log(
            `❌ ${"Task queue error\x1b[31m"}: ${
              error.message
            }. Retries left: ${retries}`
          );
          if (retries === 0) {
            console.log(`❌ ${"Task failed after 2 retries".red}`);
          }
        }
      }

      // Introduce a delay before processing the next task
      await this.delay(2000); // Delay for 2 seconds (2000 milliseconds)
    }

    this.running = false;
  }
  // Thêm công việc vào hàng đợi
  add(task) {
    this.queue.push(task);
    this.run(); // Chạy công việc
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = AsyncQueue;
