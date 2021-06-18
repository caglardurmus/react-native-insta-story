# react-native-insta-story.podspec

require "json"

package = JSON.parse(File.read(File.join(__dir__, "package.json")))

Pod::Spec.new do |s|
  s.name         = "react-native-insta-story"
  s.version      = package["version"]
  s.summary      = package["description"]
  s.description  = <<-DESC
                  react-native-insta-story
                   DESC
  s.homepage     = "https://github.com/caglardurmus/react-native-insta-story"
  # brief license entry:
  s.license      = "MIT"
  # optional - use expanded license entry instead:
  # s.license    = { :type => "MIT", :file => "LICENSE" }
  s.authors      = { "Ahmet Çağlar Durmuş" => "caglardurmus@icloud.com" }
  s.platforms    = { :ios => "9.0" }
  s.source       = { :git => "https://github.com/caglardurmus/react-native-insta-story.git", :tag => "#{s.version}" }

  s.source_files = "ios/**/*.{h,c,cc,cpp,m,mm,swift}"
  s.requires_arc = true

  s.dependency "React"
  # ...
  # s.dependency "..."
end

