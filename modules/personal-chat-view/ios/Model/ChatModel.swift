//
//  ChatModel.swift
//  UIKitPlayground
//
//  Created by Areydra Desfikriandre on 9/15/25.
//

import UIKit
import IGListKit

enum MessageType: String, CaseIterable, Codable {
    case text
    case image
    case video
    case audio
    case document
    case voice
    case location
    case contact
    
    var displayName: String {
        switch self {
        case .text: return "Text"
        case .image: return "Image"
        case .video: return "Video"
        case .audio: return "Audio"
        case .document: return "Document"
        case .voice: return "Voice Message"
        case .location: return "Location"
        case .contact: return "Contact"
        }
    }
}

final class ChatModel: Sendable, Codable {
    // Core message properties (from database function)
    let id: String
    let message: String
    let chatId: String
    let senderId: String
    let receiverId: String
    let createdAt: Date
    let messageType: MessageType
    let isFromMe: Bool
    
    // CodingKeys for Codable conformance
    enum CodingKeys: String, CodingKey {
        case id
        case message
        case chatId = "chat_id"
        case senderId = "sender_id"
        case receiverId = "receiver_id"
        case createdAt = "created_at"
        case messageType = "message_type"
        case isFromMe = "is_from_me"
    }
    
    // MARK: - Initializers
    
    /// Primary initializer matching database function return
    init(
        id: String,
        message: String,
        chatId: String,
        senderId: String,
        receiverId: String,
        createdAt: Date,
        messageType: MessageType,
        isFromMe: Bool
    ) {
        self.id = id
        self.message = message
        self.chatId = chatId
        self.senderId = senderId
        self.receiverId = receiverId
        self.createdAt = createdAt
        self.messageType = messageType
        self.isFromMe = isFromMe
    }
    
    /// Required initializer for Codable conformance
    required convenience init(from decoder: Decoder) throws {
        let container = try decoder.container(keyedBy: CodingKeys.self)
        let id = try container.decode(String.self, forKey: .id)
        let message = try container.decode(String.self, forKey: .message)
        let chatId = try container.decode(String.self, forKey: .chatId)
        let senderId = try container.decode(String.self, forKey: .senderId)
        let receiverId = try container.decode(String.self, forKey: .receiverId)
        let createdAt = try container.decode(Date.self, forKey: .createdAt)
        let messageTypeString = try container.decode(String.self, forKey: .messageType)
        let messageType = MessageType(rawValue: messageTypeString) ?? .text
        let isFromMe = try container.decode(Bool.self, forKey: .isFromMe)
        
        self.init(
            id: id,
            message: message,
            chatId: chatId,
            senderId: senderId,
            receiverId: receiverId,
            createdAt: createdAt,
            messageType: messageType,
            isFromMe: isFromMe
        )
    }
    
    /// Initializer from Supabase response
    convenience init?(from dbResponse: [String: Any], userId: String) {
        guard
            let id = dbResponse["id"] as? String,
            let message = dbResponse["message"] as? String,
            let chatId = dbResponse["chat_id"] as? String,
            let senderId = dbResponse["sender_id"] as? String,
            let receiverId = dbResponse["receiver_id"] as? String,
            let createdAtString = dbResponse["created_at"] as? String,
            let messageTypeString = dbResponse["message_type"] as? String
        else {
            return nil
        }
        
        // Parse timestamp
        let dateFormatter = ISO8601DateFormatter()
        dateFormatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        
        guard let createdAt = dateFormatter.date(from: createdAtString) else {
            return nil
        }
        
        // Parse message type
        let messageType = MessageType(rawValue: messageTypeString) ?? .text

        self.init(
            id: id,
            message: message,
            chatId: chatId,
            senderId: senderId,
            receiverId: receiverId,
            createdAt: createdAt,
            messageType: messageType,
            isFromMe: senderId.lowercased() == userId.lowercased()
        )
    }
    
    func encode(to encoder: Encoder) throws {
        var container = encoder.container(keyedBy: CodingKeys.self)
        try container.encode(id, forKey: .id)
        try container.encode(message, forKey: .message)
        try container.encode(chatId, forKey: .chatId)
        try container.encode(senderId, forKey: .senderId)
        try container.encode(receiverId, forKey: .receiverId)
        try container.encode(createdAt, forKey: .createdAt)
        try container.encode(messageType.rawValue, forKey: .messageType)
        try container.encode(isFromMe, forKey: .isFromMe)
    }

    static func fromSupabaseResponse(messages: [[String: Any]], userId: String) -> [ChatModel] {
        return messages.compactMap { ChatModel(from: $0, userId: userId) }
    }
}

// MARK: - ListDiffable Extension
extension ChatModel: ListDiffable {
    func diffIdentifier() -> NSObjectProtocol {
        return id as NSString
    }
    
    func isEqual(toDiffableObject object: ListDiffable?) -> Bool {
        guard let other = object as? ChatModel else { return false }
        return id == other.id
            && message == other.message
            && isFromMe == other.isFromMe
            && messageType == other.messageType
            && chatId == other.chatId
            && senderId == other.senderId
            && receiverId == other.receiverId
    }
}
