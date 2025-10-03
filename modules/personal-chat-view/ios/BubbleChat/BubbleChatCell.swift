//
//  BubbleChatCell.swift
//  UIKitPlayground
//
//  Created by Areydra Desfikriandre on 9/15/25.
//

import IGListKit

class BubbleChatCell: UICollectionViewCell {
    private var containerLabelLeadingConstraint: NSLayoutConstraint?
    private var containerLabelTrailingConstraint: NSLayoutConstraint?
    private var timeLeadingConstraint: NSLayoutConstraint?
    private var timeTrailingConstraint: NSLayoutConstraint?

    private let containerChat: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
    private let containerLabel: UIView = {
        let view = UIView()
        view.translatesAutoresizingMaskIntoConstraints = false
        return view
    }()
    private let label: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.numberOfLines = 0
        label.font = UIFont.systemFont(ofSize: 16)
        label.textColor = .white
        return label
    }()
    private let time: UILabel = {
        let label = UILabel()
        label.translatesAutoresizingMaskIntoConstraints = false
        label.numberOfLines = 0
        label.font = UIFont.systemFont(ofSize: 8)
        label.textColor = .white
        return label
    }()

    override init(frame: CGRect) {
        super.init(frame: frame)
        setupView()
    }

    required init?(coder: NSCoder) {
        super.init(coder: coder)
        setupView()
    }

    private func setupView() {
        containerLabel.addSubview(label)
        containerChat.addSubview(containerLabel)
        containerChat.addSubview(time)
        contentView.addSubview(containerChat)

        NSLayoutConstraint.activate([
            containerChat.topAnchor.constraint(equalTo: contentView.topAnchor),
            containerChat.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
            containerChat.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
            containerChat.bottomAnchor.constraint(equalTo: contentView.bottomAnchor),
            
            containerLabel.topAnchor.constraint(equalTo: containerChat.topAnchor, constant: 8),
            containerLabel.bottomAnchor.constraint(equalTo: containerChat.bottomAnchor, constant: -24),
            containerLabel.widthAnchor.constraint(lessThanOrEqualTo: containerChat.widthAnchor, multiplier: 0.85),

            label.topAnchor.constraint(equalTo: containerLabel.topAnchor, constant: 16),
            label.bottomAnchor.constraint(equalTo: containerLabel.bottomAnchor, constant: -16),
            label.leadingAnchor.constraint(equalTo: containerLabel.leadingAnchor, constant: 16),
            label.trailingAnchor.constraint(equalTo: containerLabel.trailingAnchor, constant: -16),
            
            time.bottomAnchor.constraint(equalTo: containerLabel.bottomAnchor, constant: 16)
        ])

        containerLabelLeadingConstraint = containerLabel.leadingAnchor.constraint(equalTo: containerChat.leadingAnchor)
        containerLabelTrailingConstraint = containerLabel.trailingAnchor.constraint(equalTo: containerChat.trailingAnchor)
        timeLeadingConstraint = time.leadingAnchor.constraint(equalTo: containerChat.leadingAnchor)
        timeTrailingConstraint = time.trailingAnchor.constraint(equalTo: containerChat.trailingAnchor)
    }

    func configure(with chat: ChatModel) {
        let isSender = chat.isFromMe
        
        label.text = chat.message
        time.text = FormatUtils.messageTime(chat.createdAt)
        
        containerLabelLeadingConstraint?.isActive = !isSender
        containerLabelTrailingConstraint?.isActive = isSender
        timeLeadingConstraint?.isActive = !isSender
        timeTrailingConstraint?.isActive = isSender
        
        containerLabel.backgroundColor = isSender ?
            UIColor(red: 14/255, green: 8/255, blue: 71/255, alpha: 1) :
            UIColor(red: 99/255, green: 95/255, blue: 246/255, alpha: 1)
        
        containerLabel.layer.cornerRadius = 12
        containerLabel.layer.maskedCorners = isSender ?
            [.layerMinXMaxYCorner, .layerMaxXMaxYCorner, .layerMinXMinYCorner] :
            [.layerMinXMaxYCorner, .layerMaxXMaxYCorner, .layerMaxXMinYCorner]
    }
}
