package expo.modules.personalchatview

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class PersonalChatViewModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("PersonalChatView")
    
    View(PersonalChatView::class) {
      // Text prop
      Prop("text") { view: PersonalChatView, text: String ->
        view.setText(text)
      }
      
      // Background color prop
      Prop("backgroundColor") { view: PersonalChatView, color: Int ->
        view.setContainerBackgroundColor(color)
      }
      
      // Event handlers
      Events("onPersonalChatPress")

      // Cleanup method
      AsyncFunction("cleanup") { viewTag: Int ->
        val view = appContext.findView<PersonalChatView>(viewTag)
        view?.cleanup()
      }
    }
  }
}