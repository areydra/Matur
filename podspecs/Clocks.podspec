Pod::Spec.new do |s|
  s.name             = 'Clocks'
  s.version          = '1.0.6'
  s.summary          = 'A few clocks that make working with Swift concurrency more testable and more versatile.'
  s.homepage         = 'https://github.com/pointfreeco/swift-clocks'
  s.license          = { :type => 'MIT' }
  s.author           = 'Point-Free'
  s.source           = {
    :git => 'https://github.com/pointfreeco/swift-clocks.git',
    :tag => "#{s.version}"
  }

  s.swift_version = '6.0'
  s.ios.deployment_target = '13.0'
  s.osx.deployment_target = '10.15'
  s.tvos.deployment_target = '13.0'
  s.watchos.deployment_target = '6.0'
  
  s.source_files = 'Sources/Clocks/**/*.swift'
  s.module_name = 'Clocks'
  
  # Dependencies based on Package.swift
  s.dependency 'ConcurrencyExtras'
  s.dependency 'IssueReporting'
  s.dependency 'XCTestDynamicOverlay'
end