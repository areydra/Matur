//
//  FormatUtils.swift
//  Pods
//
//  Created by Areydra Desfikriandre on 9/25/25.
//

class FormatUtils {
    static func messageTime(_ date: Date) -> String {
        let formatter = DateFormatter()
        
        let calendar = Calendar.current
        if calendar.isDateInToday(date) {
            formatter.dateFormat = "HH:mm"
        } else if calendar.isDateInYesterday(date) {
            return "Yesterday"
        } else if calendar.dateInterval(of: .weekOfYear, for: Date())?.contains(date) == true {
            formatter.dateFormat = "EEEE"
        } else {
            formatter.dateFormat = "MM/dd/yy"
        }
        
        return formatter.string(from: date)
    }

}
