import { model, Schema } from "mongoose";

export interface VoiceConfigSchema {
  memberId: String;
  getInvites: Boolean;
}

export default model<VoiceConfigSchema>(
  "voice_config",
  new Schema({
    memberId: String,
    getInvites: Boolean,
  })
);
