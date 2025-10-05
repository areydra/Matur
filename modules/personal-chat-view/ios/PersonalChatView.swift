import UIKit
import ExpoModulesCore
import IGListKit

final class PersonalChatView: ExpoView {
    // MARK: - Types
    private enum Constants {
        static let collectionViewMargin: CGFloat = 16
        static let inputContainerMinHeight: CGFloat = 60
        static let inputContainerMaxHeight: CGFloat = 120
        static let sendButtonSize: CGFloat = 30
        static let textViewMargin: CGFloat = 16
        static let buttonMargin: CGFloat = 12
        static let minimumLineSpacing: CGFloat = 8
        static let cornerRadius: CGFloat = 30
        
        enum Colors {
            static let background = UIColor(red: 34/255, green: 12/255, blue: 97/255, alpha: 1)
            static let inputContainer = UIColor(red: 14/255, green: 8/255, blue: 71/255, alpha: 1)
            static let sendButton = UIColor(red: 153/255, green: 81/255, blue: 245/255, alpha: 1)
            static let placeholder = UIColor(red: 151/255, green: 144/255, blue: 204/255, alpha: 1)
        }
    }
    
    // MARK: - Properties
    private var currentChatId: String?
    private var hasPositionedInitially = false
    private var messages: [ChatModel] = []
    private var senderId: String?
    private var receiverId: String?
    private var chatId: String?
    private var chatRangeFrom: Int = 0
    private var chatRangeTo: Int = 0
    private let onSendMessage = EventDispatcher()
    private var inputContainerBottomConstraint: NSLayoutConstraint!
    private var collectionViewBottomConstraint: NSLayoutConstraint!
    private var textViewHeightConstraint: NSLayoutConstraint!
    private var isLoadingFetchingNewMessage = false
    
    // MARK: - UI Components
    private lazy var collectionView: UICollectionView = {
        let layout = createCollectionViewLayout()
        let collectionView = UICollectionView(frame: .zero, collectionViewLayout: layout)
        collectionView.translatesAutoresizingMaskIntoConstraints = false
        collectionView.backgroundColor = Constants.Colors.background
        collectionView.alwaysBounceVertical = true
        collectionView.showsVerticalScrollIndicator = false
        collectionView.transform = CGAffineTransform(scaleX: 1, y: -1)
        return collectionView
    }()
    
    private lazy var inputContainerView: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        view.backgroundColor = Constants.Colors.inputContainer
        view.layer.cornerRadius = Constants.cornerRadius
        return view
    }()
    
    private lazy var textView: UITextView = {
        let textView = UITextView()
        textView.translatesAutoresizingMaskIntoConstraints = false
        textView.backgroundColor = .clear
        textView.textColor = .white
        textView.font = .systemFont(ofSize: 14)
        textView.isScrollEnabled = false
        textView.delegate = self
        
        textView.text = "Type Message..."
        textView.textColor = Constants.Colors.placeholder
        
        return textView
    }()
    
    private lazy var sendButton: UIButton = {
        let button = UIButton(type: .system)
        button.translatesAutoresizingMaskIntoConstraints = false
        button.setImage(createSendButtonImage(), for: .normal)
        button.tintColor = .white
        button.backgroundColor = Constants.Colors.sendButton
        button.layer.cornerRadius = Constants.sendButtonSize / 2
        button.addTarget(self, action: #selector(sendButtonTapped), for: .touchUpInside)
        return button
    }()

    // Change from stored property to lazy property
    private lazy var tapGesture: UITapGestureRecognizer = {
        let gesture = UITapGestureRecognizer(target: self, action: #selector(dismissKeyboard))
        gesture.cancelsTouchesInView = false
        gesture.delegate = self
        return gesture
    }()
    
    private lazy var adapter: ListAdapter = {
        ListAdapter(updater: ListAdapterUpdater(), viewController: nil)
    }()
    
    // MARK: - Initialization
    required init(appContext: AppContext? = nil) {
        super.init(appContext: appContext)
        setupViews()
        setupAdapter()
        setupObservers()
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
    }
    
    // MARK: - Lifecycle
    override func layoutSubviews() {
        super.layoutSubviews()
        handleInitialPositioning()
    }
    
    // MARK: - Setup Methods
    private func setupViews() {
        backgroundColor = Constants.Colors.background
        addSubviews()
        setupConstraints()
    }
    
    private func addSubviews() {
        addSubview(collectionView)
        addSubview(inputContainerView)
        inputContainerView.addSubview(textView)
        inputContainerView.addSubview(sendButton)
    }
    
    private func setupConstraints() {
        inputContainerBottomConstraint = inputContainerView.bottomAnchor.constraint(equalTo: safeAreaLayoutGuide.bottomAnchor)
        
        // Create height constraint
        textViewHeightConstraint = textView.heightAnchor.constraint(equalToConstant: 36)

        addGestureRecognizer(tapGesture)

        NSLayoutConstraint.activate([
            // Collection View
            collectionView.topAnchor.constraint(equalTo: safeAreaLayoutGuide.topAnchor),
            collectionView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: Constants.collectionViewMargin),
            collectionView.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -Constants.collectionViewMargin),
            collectionView.bottomAnchor.constraint(equalTo: inputContainerView.topAnchor, constant: -8),

            // Input Container
            inputContainerView.leadingAnchor.constraint(equalTo: leadingAnchor, constant: Constants.collectionViewMargin),
            inputContainerView.trailingAnchor.constraint(equalTo: trailingAnchor, constant: -Constants.collectionViewMargin),
            inputContainerBottomConstraint,

            // Text View with explicit height
            textView.leadingAnchor.constraint(equalTo: inputContainerView.leadingAnchor, constant: Constants.textViewMargin),
            textView.topAnchor.constraint(equalTo: inputContainerView.topAnchor, constant: 12),
            textView.bottomAnchor.constraint(equalTo: inputContainerView.bottomAnchor, constant: -12),
            textView.trailingAnchor.constraint(equalTo: sendButton.leadingAnchor, constant: -Constants.buttonMargin),
            textViewHeightConstraint, // Add the height constraint

            // Send Button
            sendButton.trailingAnchor.constraint(equalTo: inputContainerView.trailingAnchor, constant: -Constants.textViewMargin),
            sendButton.bottomAnchor.constraint(equalTo: inputContainerView.bottomAnchor, constant: -15),
            sendButton.widthAnchor.constraint(equalToConstant: Constants.sendButtonSize),
            sendButton.heightAnchor.constraint(equalToConstant: Constants.sendButtonSize)
        ])
    }
    
    private func setupAdapter() {
        adapter.collectionView = collectionView
        adapter.dataSource = self
        adapter.scrollViewDelegate = self
    }

    private func setupObservers() {
        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillShow(_:)),
            name: UIResponder.keyboardWillShowNotification,
            object: nil
        )

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(keyboardWillHide(_:)),
            name: UIResponder.keyboardWillHideNotification,
            object: nil
        )

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAppEnteringForeground),
            name: UIApplication.willEnterForegroundNotification,
            object: nil
        )
    }
    
    // MARK: - Factory Methods
    private func createCollectionViewLayout() -> UICollectionViewFlowLayout {
        let layout = UICollectionViewFlowLayout()
        layout.minimumLineSpacing = Constants.minimumLineSpacing
        layout.minimumInteritemSpacing = 0
        return layout
    }
    
    private func createSendButtonImage() -> UIImage? {
        let symbolConfig = UIImage.SymbolConfiguration(pointSize: 12, weight: .bold)
        return UIImage(systemName: "chevron.right", withConfiguration: symbolConfig)
    }
    
    // MARK: - Positioning Logic
    private func handleInitialPositioning() {
        guard shouldAttemptInitialPositioning() else { return }
        
        hasPositionedInitially = true
        print("Positioning now with proper frame")
        
        DispatchQueue.main.async { [weak self] in
            self?.positionAtBottomImmediately()
        }
    }
    
    private func shouldAttemptInitialPositioning() -> Bool {
        !hasPositionedInitially &&
        !messages.isEmpty &&
        collectionView.frame.width > 0 &&
        collectionView.frame.height > 0
    }
    
    private func positionAtBottomImmediately() {
        print("positionAtBottomImmediately \(messages.count)")
        guard !messages.isEmpty else { return }

        adapter.performUpdates(animated: false) { [weak self] _ in
            self?.scrollToBottomAfterLayout()
        }
    }

    private func scrollToBottomAfterLayout() {
        collectionView.layoutIfNeeded()

        // Use layout's content size instead of collectionView.contentSize to avoid IGListKit height 0 issue
        let contentHeight = collectionView.collectionViewLayout.collectionViewContentSize.height
        let frameHeight = collectionView.frame.height
        print("contentHeight > frameHeight: \(contentHeight) > \(frameHeight)")

        guard contentHeight > frameHeight else {
            print("Content fits in frame, no scrolling needed")
            return
        }

        // For inverted view, bottom is at y: 0
        let bottomOffset = CGPoint(x: 0, y: 0)
        collectionView.setContentOffset(bottomOffset, animated: false)
        print("Set offset to: \(bottomOffset)")

        // Fallback mechanism with slight delay if still not positioned correctly
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) { [weak self] in
            self?.verifyAndCorrectPosition()
        }
    }

    private func verifyAndCorrectPosition() {
        let currentOffset = collectionView.contentOffset.y

        // For inverted view, bottom is at y: 0
        let expectedOffset: CGFloat = 0

        // Check if we're not at the bottom (with small tolerance)
        if abs(currentOffset - expectedOffset) > 5.0 {
            print("Correcting position: current=\(currentOffset), expected=\(expectedOffset)")
            let bottomOffset = CGPoint(x: 0, y: expectedOffset)
            collectionView.setContentOffset(bottomOffset, animated: false)
        }
    }

    private func scrollToBottomAnimated() {
        guard !messages.isEmpty else { return }

        DispatchQueue.main.async { [weak self] in
            guard let self = self else { return }

            // For inverted view, bottom is always at y: 0
            let bottomOffset = CGPoint(x: 0, y: 0)
            self.collectionView.setContentOffset(bottomOffset, animated: true)
            print("Scrolling to bottom (inverted): \(bottomOffset)")
        }
    }

    // MARK: - Keyboard Handling
    @objc private func keyboardWillShow(_ notification: Notification) {
        guard let keyboardFrame = notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect,
              let animationDuration = notification.userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double else {
            return
        }

        let keyboardHeight = keyboardFrame.height
        let safeAreaBottom = safeAreaInsets.bottom
        let additionalPadding: CGFloat = 24 // Extra space above keyboard

        inputContainerBottomConstraint.constant = -(keyboardHeight - safeAreaBottom + additionalPadding)

        UIView.animate(withDuration: animationDuration) {
            self.layoutIfNeeded()
        }
    }

    @objc private func keyboardWillHide(_ notification: Notification) {
        guard let animationDuration = notification.userInfo?[UIResponder.keyboardAnimationDurationUserInfoKey] as? Double else {
            return
        }

        inputContainerBottomConstraint.constant = 0

        UIView.animate(withDuration: animationDuration) {
            self.layoutIfNeeded()
        }
    }
    
    @objc private func handleAppEnteringForeground() {
        guard let chatId = self.chatId,
              // due to messages got transform, need to using first instead of using last
              let lastMessageId = self.messages.first?.id else {
            return
        }
        
        Task { [weak self] in
            guard let messsages = try? await SupabaseManager.shared.loadMessagesAfterId(chatId: chatId, lastMessageId: lastMessageId) else {
                return
            }
            
            await MainActor.run {
                self?.messages.insert(contentsOf: messsages, at: 0)
                self?.handleInitialPositioning()
            }
        }
    }
    
    // MARK: - Actions
    @objc private func sendButtonTapped() {
        sendMessage()
    }

    @objc func dismissKeyboard() {
        endEditing(true)
    }
    
    private func sendMessage() {
        guard let text = textView.text?.trimmingCharacters(in: .whitespacesAndNewlines),
              !text.isEmpty,
              text != "Type Message...",
              let chatId = self.chatId,
              let senderId = self.senderId,
              let receiverId = self.receiverId else { return }
        
        // Clear text view
        textView.text = ""
        textViewDidChange(textView)
        
        Task { [weak self] in
            guard let data = try? await SupabaseManager.shared.sendMessage(chatId: chatId, senderId: senderId, receiverId: receiverId, message: text) else {
                return
            }
            
            let chatModels = ChatModel.fromSupabaseResponse(
                messages: [data.message],
                userId: SupabaseManager.shared.getCurrentUserId()!
            )
            
            guard let chat = chatModels.first else {
                return
            }
            
            await MainActor.run {
                self?.messages.insert(chat, at: 0)
                self?.adapter.performUpdates(animated: true) { [weak self] _ in
                    self?.scrollToBottomAnimated()
                }

                self?.onSendMessage([
                    "message": data.message,
                    "totalUnreadCount": data.totalUnreadCount
                ])
            }
        }
    }
    
    // MARK: - Public Interface
    func addReceivedMessage(_ newReceivedMessage: [String: Any]) {
        // Create and configure a date formatter for the `created_at` string
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

        guard let id = newReceivedMessage["id"] as? String,
              let chatId = newReceivedMessage["chat_id"] as? String,
              let receiverId = newReceivedMessage["receiver_id"] as? String,
              let senderId = newReceivedMessage["sender_id"] as? String,
              // 1. Manually parse the date string with the configured formatter
              let createdAtString = newReceivedMessage["created_at"] as? String,
              let createdAt = dateFormatter.date(from: createdAtString),
              // 2. Manually create the enum from its raw string value
              let messageTypeString = newReceivedMessage["message_type"] as? String,
              let messageType = MessageType(rawValue: messageTypeString),
              let message = newReceivedMessage["message"] as? String else {
            return
        }
        
        let newMessage: ChatModel = ChatModel(
            id: id,
            message: message,
            chatId: chatId,
            senderId: senderId,
            receiverId: receiverId,
            createdAt: createdAt,
            messageType: messageType,
            isFromMe: false
        )

        Task { [weak self] in
            await MainActor.run {
                self?.messages.insert(newMessage, at: 0)
                self?.adapter.performUpdates(animated: true) { [weak self] _ in
                    self?.scrollToBottomAnimated()
                }
            }
        }
    }
    
    func setChatRoomCredentials(_ credentials: [String: Any]) {
        guard let receiverId = credentials["receiverId"] as? String,
              let senderId = credentials["senderId"] as? String,
              let chatId = credentials["chatId"] as? String,
              let chatRangeFrom = credentials["chatRangeFrom"] as? Int,
              let chatRangeTo = credentials["chatRangeTo"] as? Int,
              let supabaseUrl = credentials["supabaseUrl"] as? String,
              let supabaseKey = credentials["supabaseKey"] as? String,
              let accessToken = credentials["accessToken"] as? String,
              let refreshToken = credentials["refreshToken"] as? String else {
            print("Failed to extract user info values")
            return
        }
        
        self.senderId = senderId
        self.receiverId = receiverId
        self.chatId = chatId
        self.chatRangeFrom = chatRangeFrom
        self.chatRangeTo = chatRangeTo
        
        Task { [weak self] in
            try? await SupabaseManager.shared.configure(supabaseURL: supabaseUrl, supabaseKey: supabaseKey, accessToken: accessToken, refreshToken: refreshToken)
            
            guard let messsages = try? await SupabaseManager.shared.loadMessages(chatId: chatId, from: chatRangeFrom, to: chatRangeTo) else {
                return
            }
            
            await MainActor.run {
                self?.messages = messsages
                self?.handleInitialPositioning()
                print("✅ Messages loaded successfully: \(messsages.count) messages")
            }
        }
    }
}

extension PersonalChatView: SupabaseRealtimeDelegate {
    func didUpdateMessage(_ message: [String : Any], oldRecord: [String : Any]?) {
        print("Update Messages: \(message)")
    }
    
    func didDeleteMessage(_ messageId: String, oldRecord: [String : Any]?) {
        print("Delete Messages: \(messageId)")
    }
    
    func didChangeConnectionStatus(_ status: String) {
        print("Connection Messages: \(status)")
    }
    
    func didEncounterError(_ error: any Error) {
        print("Error Messages: \(error)")
    }
    
    func didReceiveNewMessage(_ message: [String: Any]) {
        print("New Messages: \(message)")
    }
}

// MARK: - ListAdapterDataSource
extension PersonalChatView: ListAdapterDataSource {
    func objects(for listAdapter: ListAdapter) -> [ListDiffable] {
        messages
    }
    
    func listAdapter(_ listAdapter: ListAdapter, sectionControllerFor object: Any) -> ListSectionController {
        BubbleChatSectionController()
    }
    
    func emptyView(for listAdapter: ListAdapter) -> UIView? {
        let label = UILabel()
        label.text = "No messages yet"
        label.textAlignment = .center
        label.textColor = .systemGray
        label.transform = CGAffineTransform(scaleX: 1, y: -1)
        return label
    }
}

// MARK: - UIScrollViewDelegate
extension PersonalChatView: UIScrollViewDelegate {
    func scrollViewDidScroll(_ scrollView: UIScrollView) {
        let offsetY = scrollView.contentOffset.y
        let contentHeight = scrollView.contentSize.height
        let scrollViewHeight = scrollView.frame.size.height
        
        // For inverted view, when scrolling UP (to older messages), offsetY becomes MORE NEGATIVE
        // Calculate how far from the "top" (which is visually the top, where old messages are)
        let distanceFromTop = -(offsetY + scrollViewHeight - contentHeight)
        
        let threshold: CGFloat = 200
        
        print("offsetY: \(offsetY), distanceFromTop: \(distanceFromTop)")
        
        // Trigger when user scrolls near the top (where older messages should load)
        guard distanceFromTop < threshold && !isLoadingFetchingNewMessage else { return }
        
        // Set flag IMMEDIATELY, before any async work
        isLoadingFetchingNewMessage = true
        
        let newRangeTo = chatRangeTo * 2
        let newRangeFrom = chatRangeTo
        
        print("Loading older messages...")
        
        Task { [weak self] in
            guard let self = self,
                  let chatId = self.chatId else {
                // Don't forget to reset flag if guard fails
                await MainActor.run { self?.isLoadingFetchingNewMessage = false }
                return
            }
            
            do {
                let messages = try await SupabaseManager.shared.loadMessages(
                    chatId: chatId,
                    from: newRangeFrom,
                    to: newRangeTo
                )
                
                self.appendOlderMessages(messages, from: newRangeFrom, to: newRangeTo)
            } catch {
                print("❌ Failed to load messages: \(error)")
                await MainActor.run {
                    self.isLoadingFetchingNewMessage = false
                }
            }
        }
    }
    
    @MainActor
    private func appendOlderMessages(_ newMessages: [ChatModel], from: Int, to: Int) {
        guard !newMessages.isEmpty else {
            self.isLoadingFetchingNewMessage = false
            return
        }
        
        // For inverted view: newest messages are at index 0 (bottom)
        // Older messages get appended to the end (top of screen)
        self.messages.append(contentsOf: newMessages)
        self.chatRangeFrom = from
        self.chatRangeTo = to
        
        // No scroll adjustment needed with inverted view!
        self.adapter.performUpdates(animated: false) { [weak self] _ in
            self?.isLoadingFetchingNewMessage = false
            print("✅ Loaded older messages: \(newMessages.count), total: \(self?.messages.count ?? 0)")
        }
    }
}

// MARK: - UITextViewDelegate
extension PersonalChatView: UITextViewDelegate {
    func textViewDidBeginEditing(_ textView: UITextView) {
        if textView.textColor == Constants.Colors.placeholder {
            textView.text = ""
            textView.textColor = .white
        }
    }
    
    func textViewDidEndEditing(_ textView: UITextView) {
        if textView.text.isEmpty {
            textView.text = "Type Message..."
            textView.textColor = Constants.Colors.placeholder
        }
    }
    
    func textViewDidChange(_ textView: UITextView) {
        let size = textView.sizeThatFits(CGSize(width: textView.bounds.width, height: CGFloat.greatestFiniteMagnitude))
        let newHeight = min(max(size.height, 36), 100) // Min 36, Max 100
        
        textViewHeightConstraint.constant = newHeight
        textView.isScrollEnabled = newHeight >= 100
        
        UIView.animate(withDuration: 0.2) {
            self.layoutIfNeeded()
        }
    }
}

// MARK: - UIGestureRecognizerDelegate
extension PersonalChatView: UIGestureRecognizerDelegate {
    func gestureRecognizer(_ gestureRecognizer: UIGestureRecognizer, shouldReceive touch: UITouch) -> Bool {
        if touch.view == inputContainerView ||
           touch.view == textView ||
           touch.view == sendButton ||
           inputContainerView.bounds.contains(touch.location(in: inputContainerView)) {
            return false
        }
        return true
    }
}
