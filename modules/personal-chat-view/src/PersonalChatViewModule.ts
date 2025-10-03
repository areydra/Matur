import { NativeModule, requireNativeModule } from 'expo';

import { PersonalChatViewModuleEvents } from './PersonalChatView.types';

declare class PersonalChatViewModule extends NativeModule<PersonalChatViewModuleEvents> {
  PI: number;
  hello(): string;
  setValueAsync(value: string): Promise<void>;
  configure(supabaseURL: string, supabaseKey: string, accessToken: string, refreshToken: string): Promise<void>;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<PersonalChatViewModule>('PersonalChatView');
