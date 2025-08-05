import React from 'react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-[#0044CC] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">CT</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">Choice Talent</span>
            </div>
            <p className="text-gray-600 text-sm">
              Empowering talent acquisition with innovative solutions.
            </p>
          </div>

          {/* Product Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-600 hover:text-[#0044CC] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-gray-600 hover:text-[#0044CC] transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Support</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-[#0044CC] transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-[#0044CC] transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="col-span-1">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-[#0044CC] transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-600 hover:text-[#0044CC] transition-colors">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6">
          <p className="text-center text-sm text-gray-600">
            © {new Date().getFullYear()} Choice Talent. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
} 