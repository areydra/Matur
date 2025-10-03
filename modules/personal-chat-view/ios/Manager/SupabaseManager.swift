import Foundation
import Supabase
//import Realtime

enum SupabaseManagerError: Error {
    case notConfigured
    case invalidURL
    case configurationError(String)
    case authenticationRequired
    case networkError(Error)
    case databaseError(Error)
    case invalidResponse(String)
}

// Codable struct for message data
struct MessageData: Codable {
    let id: String?
    let chatId: String
    let senderId: String
    let receiverId: String
    let message: String
    let messageType: String
    let createdAt: Date?
    
    private enum CodingKeys: String, CodingKey {
        case id
        case chatId = "chat_id"
        case senderId = "sender_id"
        case receiverId = "receiver_id"
        case message
        case messageType = "message_type"
        case createdAt = "created_at"
    }
    
    init(chatId: String, senderId: String, receiverId: String, message: String, messageType: String = "text") {
        self.id = nil
        self.chatId = chatId
        self.senderId = senderId
        self.receiverId = receiverId
        self.message = message
        self.messageType = messageType
        self.createdAt = nil
    }
}

// Protocol for realtime message callbacks
protocol SupabaseRealtimeDelegate: AnyObject {
    func didReceiveNewMessage(_ message: [String: Any])
    func didUpdateMessage(_ message: [String: Any], oldRecord: [String: Any]?)
    func didDeleteMessage(_ messageId: String, oldRecord: [String: Any]?)
    func didChangeConnectionStatus(_ status: String)
    func didEncounterError(_ error: Error)
}

class SupabaseManager {
    static let shared = SupabaseManager()
    
    private var isConfigured = false
    private var supabaseClient: SupabaseClient?
    private var currentChannel: RealtimeChannelV2?
    private var currentChatId: String?
    
    weak var delegate: SupabaseRealtimeDelegate?
    
    private init() {}
    
    func configure(supabaseURL: String, supabaseKey: String, accessToken: String, refreshToken: String) async throws {
        guard !supabaseURL.isEmpty,
              !supabaseKey.isEmpty else {
            throw SupabaseManagerError.configurationError("Supabase URL and key cannot be empty")
        }
        
        guard let url = URL(string: supabaseURL) else {
            throw SupabaseManagerError.invalidURL
        }
        
        supabaseClient = SupabaseClient(
            supabaseURL: url,
            supabaseKey: supabaseKey
        )
        
        guard let client = supabaseClient else {
            throw SupabaseManagerError.configurationError("Failed to create Supabase client")
        }
        
        do {
            try await client.auth.setSession(accessToken: accessToken, refreshToken: refreshToken)
            isConfigured = true
            print("✅ Supabase configured and authenticated successfully")
        } catch {
            throw SupabaseManagerError.authenticationRequired
        }
    }
    
    private func ensureConfigured() throws {
        guard isConfigured, supabaseClient != nil else {
            throw SupabaseManagerError.notConfigured
        }
    }

    func sendMessage(chatId: String, senderId: String, receiverId: String, message: String) async throws -> [String: Any]? {
        try ensureConfigured()
        guard let client = supabaseClient else {
            throw SupabaseManagerError.notConfigured
        }

        let messageData = [
            "p_chat_id": chatId,
            "p_sender_id": senderId,
            "p_receiver_id": receiverId,
            "p_message": message,
            "p_message_type": "text"
        ]

        do {
            let response = try await client.rpc("send_message", params: messageData).execute().data
            
            // Parse the response data
            guard let jsonObject = try JSONSerialization.jsonObject(with: response) as? [String: Any] else {
                throw SupabaseManagerError.invalidResponse("Expected object response")
            }
            
            return jsonObject
        } catch {
            print("❌ Failed to send message: \(error)")
            throw SupabaseManagerError.databaseError(error)
        }
    }

    func loadMessages(chatId: String, from: Int = 0, to: Int = 50) async throws -> [ChatModel] {
        print("Load Messages")
        try ensureConfigured()
        guard let client = supabaseClient else {
            throw SupabaseManagerError.notConfigured
        }
        
        do {
            print("Load Messages Execute 1")
            // Get response as Data and decode it manually
            let response: Data = try await client.from("messages")
                .select()
                .eq("chat_id", value: chatId)
                .order("created_at", ascending: false)
                .range(from: from, to: to)
                .execute()
                .data
            
            // Decode JSON data to [[String: Any]]
            guard let jsonArray = try JSONSerialization.jsonObject(with: response) as? [[String: Any]] else {
                throw SupabaseManagerError.invalidResponse("Expected array response")
            }
            print("Load Messages Execute 2: \(jsonArray)")
            
            // ChatModel failed causing loaded 0 messages
            let chatModels = ChatModel.fromSupabaseResponse(messages: jsonArray, userId: getCurrentUserId()!)
            print("✅ Loaded \(chatModels.count) messages for chat between \(chatId)")
            return chatModels
        } catch {
            print("❌ Failed to load messages: \(error)")
            throw SupabaseManagerError.databaseError(error)
        }
    }
    
    func getCurrentUserId() -> String? {
        return supabaseClient?.auth.currentUser?.id.uuidString
    }
    
    func disconnect() {
        Task {
            if let channel = currentChannel {
                await channel.unsubscribe()
                currentChannel = nil
                currentChatId = nil
            }

            print("🔌 Realtime connection disconnected")
        }
    }
    
    deinit {
        disconnect()
    }
}

// Extension for convenience methods
extension SupabaseManager {
    
    func generateChatId(userId1: String, userId2: String) -> String {
        // Create consistent chat ID regardless of user order
        let sortedIds = [userId1, userId2].sorted()
        return "\(sortedIds[0])_\(sortedIds[1])"
    }
    
    func isCurrentlySubscribedTo(chatId: String) -> Bool {
        return currentChatId == chatId && currentChannel != nil
    }
}

// Empty response struct for insert operations
struct EmptyResponse: Decodable {}
