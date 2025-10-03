//
//  BubbleChatSectionController.swift
//  UIKitPlayground
//
//  Created by Areydra Desfikriandre on 9/15/25.
//

import IGListKit

extension String {
    func heightForWidth(_ width: CGFloat, font: UIFont) -> CGFloat {
        let constraintRect = CGSize(width: width, height: .greatestFiniteMagnitude)
        let boundingBox = self.boundingRect(
            with: constraintRect,
            options: [.usesLineFragmentOrigin, .usesFontLeading],
            attributes: [.font: font],
            context: nil
        )
        return ceil(boundingBox.height)
    }
}

class BubbleChatSectionController: ListSectionController {
    private var chat: ChatModel?
    
    override func numberOfItems() -> Int {
        return 1
    }
    
    override func sizeForItem(at index: Int) -> CGSize {
        guard let chat = chat,
              let containerSize = collectionContext?.containerSize else {
            return CGSize(width: 0, height: 44)
        }
        
        // Calculate dynamic height based on text content
        let width = containerSize.width
        let maxBubbleWidth = width * 0.8
        let textWidth = maxBubbleWidth - 16
        
        let font = UIFont.systemFont(ofSize: 16)
        let textHeight = chat.message.heightForWidth(textWidth, font: font)
        let bubbleHeight = textHeight + 16 + 16 + 16 + 16// Margin Each Cell + Padding Each cell + Padding Bubble + Time text space

        return CGSize(width: width, height: bubbleHeight)
    }
    
    override func cellForItem(at index: Int) -> UICollectionViewCell {
        guard let cell = collectionContext.dequeueReusableCell(of: BubbleChatCell.self, for: self, at: index) as? BubbleChatCell else {
            fatalError("Could not dequeue BubbleChatCell")
        }
        
        cell.contentView.transform = CGAffineTransform(scaleX: 1, y: -1)

        if let message = chat {
            cell.configure(with: message)
        }
        
        return cell
    }
    
    override func didUpdate(to object: Any) {
        chat = object as? ChatModel
    }
}
