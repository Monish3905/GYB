import { app } from './app';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Global Payment Operating System started on port ${PORT}`);
  console.log(`Ready to intelligently route payments across internal and external rails.`);
});
