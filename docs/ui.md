# UI Coding Standards

## Component Library

**ONLY use Nuxt UI components for all UI elements.**

- No custom components should be created
- All buttons, inputs, modals, tables, cards, etc. must use Nuxt UI components
- Refer to the [Nuxt UI documentation](https://ui.nuxt.com/) for available components

### Examples

```vue
<!-- Correct -->
<UButton>Submit</UButton>
<UInput v-model="name" />
<UCard>Content</UCard>
<UTable :rows="data" />

<!-- Incorrect - DO NOT create custom components -->
<CustomButton>Submit</CustomButton>
<MyInput v-model="name" />
```

## Theme

Use the **default Nuxt UI theme**. Do not override or customize the default theme colors, fonts, or spacing unless explicitly required.
