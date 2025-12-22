module.exports = {
  plugins: [
    'tailwindcss',
    'autoprefixer',
    // Add other PostCSS plugins as needed
    ...(process.env.NODE_ENV === 'production'
      ? [
          [
            'cssnano',
            {
              preset: [
                'default',
                {
                  discardComments: {
                    removeAll: true,
                  },
                  normalizeWhitespace: false,
                },
              ],
            },
          ],
        ]
      : []),
  ],
};