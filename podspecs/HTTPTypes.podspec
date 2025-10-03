Pod::Spec.new do |s|
  s.name             = 'HTTPTypes'
  s.version          = '1.3.0'
  s.summary          = 'Version-independent HTTP currency types for Swift'
  s.homepage         = 'https://github.com/apple/swift-http-types'
  s.license          = { :type => 'Apache 2.0' }
  s.author           = 'Apple Inc.'
  s.source           = {
    :git => 'https://github.com/apple/swift-http-types.git',
    :tag => "#{s.version}"
  }

  s.swift_version = '5.7.1'
  s.ios.deployment_target = '13.0'
  s.osx.deployment_target = '10.15'
  s.tvos.deployment_target = '13.0'
  s.watchos.deployment_target = '6.0'
  
  s.source_files = 'Sources/HTTPTypes/**/*.swift'
  s.module_name = 'HTTPTypes'
end