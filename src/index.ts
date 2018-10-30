export enum LogLevel {
  ERROR = 0x1,
  REPLICATION = 0x2,
  DEBUG = 0x4,
  ALL = ERROR | REPLICATION | DEBUG
}

export interface Loggable {
  log(message: LogRecord | string, level?: LogLevel);
}

export type LogPlainRecord = {
  id: string;
  time: number;
  message: string;
}

export class LogRecord {
  public readonly time: number;

  constructor(public readonly id: string, public readonly message: string) {
    this.time = Date.now();
  }

  getContent(): LogPlainRecord {
    return { time: this.time, message: this.message, id: this.id };
  }
}

export class LogManager implements Loggable {
  private children: Loggable[] = [];

  constructor(private id: string, private currentLevel: LogLevel) {
  }

  addOutputTo(child: Loggable) {
    this.children.push(child);
  }

  log(message: LogRecord | string, requestedLevel: LogLevel = LogLevel.ERROR) {
    if (message instanceof LogRecord) {
      this.children.map(listener => listener.log(message));
    } else if (typeof message === 'string') {
      if ((this.currentLevel & requestedLevel) !== requestedLevel) {
        return;
      }

      this.children.map(listener => listener.log(this.prepareLogRecord(message)));
    } else {
      throw Error('wrong log argument type');
    }
  }

  private prepareLogRecord(message: string): LogRecord {
    return new LogRecord(this.id, message);
  }
}

export class StorageLogger implements Loggable {
  private content = [];

  log(logRecord: LogRecord, level: LogLevel = LogLevel.ERROR) {
    this.content.push(logRecord);
  }

  getContent(): LogPlainRecord[] {
    return this.content.map(record => record.getContent());
  }
}
