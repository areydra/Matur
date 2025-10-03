import ExpoModulesCore
import UIKit

public class PersonalChatViewModule: Module {
  public func definition() -> ModuleDefinition {
    Name("PersonalChatView")
    
    View(PersonalChatView.self) {
        // Pass object as dictionary
        Prop("chatRoomCredentials") { (view: PersonalChatView, userInfo: [String: Any]) in
            view.setChatRoomCredentials(userInfo)
        }

        Events("onSendMessage")
    }

    AsyncFunction("addReceivedMessage") { [weak self] (viewRef: Int, message: [String: Any]) -> Void in
        DispatchQueue.main.async {
            guard let view = self?.appContext?.findView(withTag: viewRef, ofType: PersonalChatView.self) else {
                return
            }
            view.addReceivedMessage(message)
        }
    }

    AsyncFunction("configure") { (supabaseURL: String, supabaseKey: String, accessToken: String, refreshToken: String) in
      try await SupabaseManager.shared.configure(supabaseURL: supabaseURL, supabaseKey: supabaseKey, accessToken: accessToken, refreshToken: refreshToken)
    }
  }
}
