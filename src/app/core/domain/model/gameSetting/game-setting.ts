export class GameSetting {
  Id: number;
  GameInstanceId: number;
  ConfigKey: string;
  ConfigValue: string;

  constructor(data: any) {
    this.Id = data.Id;
    this.GameInstanceId = data.GameInstanceId;
    this.ConfigKey = data.ConfigKey;
    this.ConfigValue = data.ConfigValue;
  }
}
