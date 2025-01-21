const uploadBook = async (file: File, title: string, author: string) => {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    
    // Upload the file
    const { data: fileData, error: uploadError } = await supabase.storage
      .from('epub_files')
      .upload(`${slug}.epub`, file);
      
    if (uploadError) throw uploadError;
    
    // Get the public URL
    const { data: { publicUrl } } = supabase.storage
      .from('epub_files')
      .getPublicUrl(`${slug}.epub`);
      
    // Create the book record
    const { error: insertError } = await supabase
      .from('books')
      .insert({
        title,
        author,
        slug,
        epub_file_url: publicUrl
      });
      
    if (insertError) throw insertError;
  };
