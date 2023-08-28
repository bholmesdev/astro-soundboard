import { Input } from "../../../components/ui/input";

export function NewBoardForm() {
  return (
    <form onSubmit={async (e) => {
      e.preventDefault();
      // @ts-expect-error They should've fixed form types 3 years ago
      const formData = new FormData(e.target);

      console.log('TODO: validation');
      
      await fetch('/api/boards/new', {
        method: 'POST',
        body: formData,
      });
    }}>
      <Input type="url" name="url" />
    </form>
  )
}