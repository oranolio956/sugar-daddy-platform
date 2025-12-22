module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
    // Add other PostCSS plugins as needed
    ...(process.env.NODE_ENV === 'production'
      ? [
          require('cssnano')({
            preset: [
              'default',
              {
                discardComments: {
                  removeAll: true,
                },
                normalizeWhitespace: false,
              },
            ],
          }),
        ]
      : []),
  ],
};