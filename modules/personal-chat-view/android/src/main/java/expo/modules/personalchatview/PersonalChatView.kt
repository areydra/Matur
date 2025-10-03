package expo.modules.personalchatview

import android.content.Context
import android.graphics.Color
import android.util.AttributeSet
import android.view.Gravity
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import androidx.core.content.ContextCompat
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView

class PersonalChatView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val containerLayout: LinearLayout
  private val textView: TextView
  
  init {
    // Create container
    containerLayout = LinearLayout(context).apply {
      orientation = LinearLayout.VERTICAL
      gravity = Gravity.CENTER
      setPadding(32, 32, 32, 32)
      setBackgroundColor(ContextCompat.getColor(context, android.R.color.holo_blue_light))
      layoutParams = ViewGroup.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT,
        ViewGroup.LayoutParams.MATCH_PARENT
      )
    }
    
    // Create text view
    textView = TextView(context).apply {
      text = "Native Android View"
      textSize = 16f
      setTextColor(Color.WHITE)
      gravity = Gravity.CENTER
      layoutParams = LinearLayout.LayoutParams(
        LinearLayout.LayoutParams.WRAP_CONTENT,
        LinearLayout.LayoutParams.WRAP_CONTENT
      )
    }
    
    containerLayout.addView(textView)
    addView(containerLayout)
    
    // Handle touch events
    setOnClickListener {
      onPersonalChatPress?.invoke(mapOf<String, Any>())
    }
  }
  
  fun setText(text: String) {
    textView.text = text
  }
  
  fun setContainerBackgroundColor(color: Int) {
    containerLayout.setBackgroundColor(color)
  }

  fun cleanup() {
    println("PersonalChatView: Cleaning up native Android view")

    // Reset text to default
    textView.text = "Native Android View"

    // Clear any click listeners (re-add the main one)
    setOnClickListener {
      onPersonalChatPress?.invoke(mapOf<String, Any>())
    }
  }

  // Event callback
  var onPersonalChatPress: ((Map<String, Any>) -> Unit)? = null
}