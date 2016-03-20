---
layout: post
title: 'Minimising State Changes in your Mesh Pipeline (Part 3): A state-optimal Model.Draw
  replacement for XNA'
date: '2009-01-27 13:17:36 +0000'
---

This is quite an unexpected article in the series. I had planned to cover cross-model optimisation, however my work over the past week has lead to another interesting problem - rendering the SAME model multiple times.

Last week I was working on a game in XNA. In this game, we render the same model lots and lots of times. This model is actually a model of a character, and is quite expensive in terms of the number of state changes (mostly due to different parts of the model using different textures). We were using the 'Model' class which is provided as part of the XNA Framework. This class has a 'Draw' method which can be used to render one instance of the model. As expected, when 'Draw' is called the following operations are performed:

* For each part of the model
	* Set GPU resources required to render the part
	* Render the part

So imagine you now have 100 of these models. For each of these instances, XNA will issue the SAME set of state change commands:

* For each instance of the model
	* For each part of the model
		* Set GPU resources required to render the part
		* Render the part

With all the other rendering that is being performed, this can potentially (and did) lead to a noticable drop in framerate. In order to fix this, we can exploit the fact that each model instance posesses almost the EXACT same state as all other model instances. I say "almost", because each instance will have a different world transformation matrix (otherwise, all of these instances would be rendered on top of each other!). We can therefore re-order the loops such that we only make one pass over each model part:

* For each part of the model
	* Set GPU resources required to render the part
	* For each instance of the model
		* Set world transformation matrix
		* Render the part

By moving the state changes out of the inner loop, the number of state changes has obviously decreased to one set of changes per unique model.

Below is an extension method that demonstrates this (requires XNA 3.0):

{% highlight csharp %}
public static class ModelExtensionMethods
{
    public static void
    DrawMany(
        this Model model,
        Matrix projectionMatrix,
        Matrix viewMatrix,
        Matrix[] worldMatrices
    )
    {
        // Generate bone matrices
        Matrix[] boneMatrices = new Matrix[model.Bones.Count];
        model.CopyAbsoluteBoneTransformsTo(boneMatrices);

        // Render each mesh in the model lots of times
        foreach (ModelMesh mesh in model.Meshes)
        {
            // Obtain a reference to the graphics device from one of
            // the model's GPU resources
            // (they should all share the same graphics device)
            GraphicsDevice graphicsDevice =
                mesh.IndexBuffer.GraphicsDevice;

            graphicsDevice.Indices = mesh.IndexBuffer;

            foreach (ModelMeshPart part in mesh.MeshParts)
            {
                graphicsDevice.Vertices[0].SetSource(
                    mesh.VertexBuffer,
                    part.StreamOffset,
                    part.VertexStride );

                graphicsDevice.VertexDeclaration =
                    part.VertexDeclaration;

                BasicEffect basicEffect =
                    part.Effect as BasicEffect;

                basicEffect.Projection =
                    projectionMatrix;

                basicEffect.View =
                    viewMatrix;

                basicEffect.Begin();

                EffectPassCollection passes =
                    basicEffect.CurrentTechnique.Passes;

                foreach (EffectPass effectPass in passes)
                {
                    effectPass.Begin();

                    foreach (Matrix instance in worldMatrices)
                    {
                        basicEffect.World =
                            boneMatrices[mesh.ParentBone.Index] *
                            instance;

                        basicEffect.CommitChanges();

                        graphicsDevice.DrawIndexedPrimitives(
                            PrimitiveType.TriangleList,
                            part.BaseVertex,
                            0,
                            part.NumVertices,
                            part.StartIndex,
                            part.PrimitiveCount );
                    }

                    effectPass.End();
                }

                basicEffect.End();
            }
        }
    }
}
{% endhighlight %}
